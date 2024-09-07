use std::{collections::BTreeMap, fmt::Debug, time::Duration};

use axum::{
    extract::{
        ws::{Message, WebSocket},
        State, WebSocketUpgrade,
    },
    response::IntoResponse,
};
use futures::{
    stream::{SplitSink, SplitStream},
    SinkExt, StreamExt,
};
use serde::{Deserialize, Serialize};
use tokio::{
    sync::{
        mpsc::{self, Sender},
        oneshot,
    },
    time::sleep,
};

use crate::{auth::AuthToken, common::state::AppState, typing_test::Seed};

pub mod room;

pub async fn join_matchmaking(
    State(state): State<AppState>,
    auth_token: AuthToken,
    ws: WebSocketUpgrade,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(state, auth_token, socket))
}

async fn handle_socket(state: AppState, auth_token: AuthToken, socket: WebSocket) {
    let matchmaking = state.matchmaking();
    let mut player = Player::new(auth_token.user_id, auth_token.username, socket);
    if !player.ping().await {
        return;
    }
    let (tx, rx) = oneshot::channel();
    matchmaking
        .send(MmsMsg::Join {
            player,
            responder: tx,
        })
        .await
        .unwrap();
    let _ = rx.await;
}

const PING_BYTES: [u8; 4] = [0, 1, 2, 3];

const TIME_UNTIL_EVICTION: Duration = Duration::from_secs(5);
const MAX_USERS_PER_LOBBY: usize = 5;
const INACTIVITY_DURATION: Duration = Duration::from_secs(20);

pub fn spawn_matchmaking_service() -> Mms {
    let (tx, mut rx) = mpsc::channel::<MmsMsg>(32);

    let self_tx = tx.clone();
    tokio::spawn(async move {
        let mut lobby_id: u32 = 0;
        let mut lobby = Vec::<Player>::new();
        let mut players = BTreeMap::<u32, u32>::new();

        while let Some(mms_msg) = rx.recv().await {
            match mms_msg {
                MmsMsg::Join {
                    player: mut new_player,
                    responder,
                } => {
                    if players.get(&new_player.id).is_some() {
                        responder
                            .send(Err(MmsError::JoinError(new_player)))
                            .unwrap();
                        continue;
                    }

                    responder.send(Ok(())).unwrap();
                    players.insert(new_player.id.clone(), lobby_id);
                    for player in &mut lobby {
                        player
                            .send(&joined_msg(&new_player.username))
                            .await
                            .unwrap();
                        new_player
                            .send(&joined_msg(&player.username))
                            .await
                            .unwrap();
                    }
                    lobby.push(new_player);

                    if lobby.len() == 2 {
                        let mms = self_tx.clone();
                        tokio::spawn(async move {
                            sleep(TIME_UNTIL_EVICTION).await;
                            mms.send(MmsMsg::Evict(lobby_id)).await.unwrap();
                        });
                    }

                    if lobby.len() == MAX_USERS_PER_LOBBY {
                        let mms = self_tx.clone();
                        tokio::spawn(start_race(mms, lobby_id, lobby.drain(..).collect()));
                        lobby_id = lobby_id.wrapping_add(1);
                    }
                }
                MmsMsg::Evict(id) => {
                    if id == lobby_id {
                        let mms = self_tx.clone();
                        tokio::spawn(start_race(mms, lobby_id, lobby.drain(..).collect()));
                    }
                }
                MmsMsg::Leave { id, lobby_id } => {
                    if players.get(&id) == Some(&lobby_id) {
                        players.remove(&id);
                    }
                }
            }
        }
    });

    tx
}

type Responder<T> = oneshot::Sender<Result<T, MmsError>>;

pub type Mms = Sender<MmsMsg>;

#[derive(Debug)]
pub enum MmsMsg {
    Join {
        player: Player,
        responder: Responder<()>,
    },
    Leave {
        id: u32,
        lobby_id: u32,
    },
    Evict(u32),
}

#[derive(Debug)]
pub enum MmsError {
    JoinError(Player),
}

async fn start_race(mms: Mms, lobby_id: u32, mut lobby: Vec<Player<WithRx>>) {
    let seed: Seed = rand::random();
    let start_msg = start_msg(seed);
    for player in &mut lobby {
        player.send(&start_msg).await.unwrap();
    }

    let (race_tx, mut race_rx) = mpsc::channel::<RaceMsg>(32);

    let mut race = Vec::new();
    for player in lobby {
        let race_tx = race_tx.clone();
        let mms = mms.clone();

        let (player_rx, player) = player.take_receiver();
        let player_id = player.id;
        let username = player.username.clone();
        race.push(player);
        tokio::spawn(async move {
            let player_rx = tokio_stream::StreamExt::timeout(player_rx, INACTIVITY_DURATION);
            tokio::pin!(player_rx);

            while let Some(result) = player_rx.next().await {
                let Ok(result) = result else {
                    let _ = race_tx.send(RaceMsg::Timeout { username }).await;
                    break;
                };
                let Ok(message) = result else {
                    break;
                };
                match message {
                    Message::Text(message) => {
                        let race_msg = serde_json::from_str(&message).expect("no error");
                        let is_finished = match &race_msg {
                            RaceMsg::Finish { .. } => true,
                            _ => false,
                        };
                        race_tx.send(race_msg).await.unwrap();
                        if is_finished {
                            break;
                        }
                    }
                    Message::Close(_) => {
                        break;
                    }
                    _ => {}
                }
            }
            let _ = mms
                .send(MmsMsg::Leave {
                    id: player_id,
                    lobby_id,
                })
                .await;
        });
    }

    drop(race_tx);

    while let Some(message) = race_rx.recv().await {
        match message {
            RaceMsg::Update { ref username, .. } | RaceMsg::Finish { ref username, .. } => {
                send_msg_to_players(
                    &mms,
                    lobby_id,
                    &mut race,
                    |player| player.username != *username,
                    &message,
                )
                .await;
            }
            RaceMsg::Timeout { ref username } => {
                let pos = race
                    .iter()
                    .position(|player| player.username == *username)
                    .expect("Player is present");
                let _ = race[pos].send(&message).await;
                race.swap_remove(pos);
                send_msg_to_players(
                    &mms,
                    lobby_id,
                    &mut race,
                    |_| true,
                    &RaceMsg::Disconnect {
                        username: username.to_owned(),
                        reason: DisconnectReason::Timeout,
                    },
                )
                .await;
            }
            _ => {}
        }
    }

    for player in race {
        let _ = mms
            .send(MmsMsg::Leave {
                id: player.id,
                lobby_id,
            })
            .await;
    }
}

// Method for sending messages to players. This takes care of handling send errors, marking them as
// disconnected and informing the other remaining players of the same.
async fn send_msg_to_players(
    mms: &Mms,
    lobby_id: u32,
    race: &mut Vec<Player<WithoutRx>>,
    filter: impl Fn(&Player<WithoutRx>) -> bool,
    message: &impl Serialize,
) {
    let mut disconnected_players = Vec::new();
    for player in &mut *race {
        if !filter(player) {
            continue;
        }
        if player.send(&message).await.is_err() {
            disconnected_players.push((player.id, player.username.clone()));
        }
    }

    while !disconnected_players.is_empty() {
        race.retain(|player| {
            disconnected_players
                .iter()
                .find(|disconnected_player| player.id == disconnected_player.0)
                .is_none()
        });

        let mut new_disconnected_players = Vec::new();
        for player in &mut *race {
            let mut is_disconnected = false;
            for disconnected_player in &disconnected_players {
                let message = RaceMsg::Disconnect {
                    username: disconnected_player.1.clone(),
                    reason: DisconnectReason::Unknown,
                };
                if !is_disconnected && player.send(&message).await.is_err() {
                    new_disconnected_players.push((player.id, player.username.clone()));
                    is_disconnected = true;
                }
            }
        }

        for player in disconnected_players {
            let _ = mms
                .send(MmsMsg::Leave {
                    id: player.0,
                    lobby_id,
                })
                .await;
        }

        disconnected_players = new_disconnected_players;
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(rename_all_fields = "camelCase")]
#[serde(tag = "kind", content = "payload")]
enum RaceMsg {
    Update {
        username: String,
        progress: usize,
    },
    Finish {
        username: String,
        result: f32,
    },
    Disconnect {
        username: String,
        reason: DisconnectReason,
    },
    Timeout {
        username: String,
    },
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
enum DisconnectReason {
    Unknown,
    Timeout,
}

type PlayerTx = SplitSink<WebSocket, Message>;
type PlayerRx = SplitStream<WebSocket>;

type WithRx = PlayerRx;
type WithoutRx = ();

pub struct Player<Rx = WithRx> {
    pub id: u32,
    pub username: String,
    pub sender: PlayerTx,
    receiver: Rx,
}

impl Player {
    fn new(id: u32, username: String, socket: WebSocket) -> Self {
        let (sender, receiver) = socket.split();
        Self {
            id,
            username,
            sender,
            receiver,
        }
    }
}

impl<Rx> Player<Rx> {
    pub async fn send(&mut self, message: &impl Serialize) -> Result<(), axum::Error> {
        self.sender
            .send(Message::Text(
                serde_json::to_string(&message).expect("no error"),
            ))
            .await
    }
}

impl Player<WithRx> {
    pub async fn ping(&mut self) -> bool {
        if self
            .sender
            .send(Message::Ping(PING_BYTES.to_vec()))
            .await
            .is_err()
        {
            return false;
        }

        let Some(message) = self.receiver.next().await else {
            return false;
        };
        let Ok(message) = message else {
            return false;
        };
        return message == Message::Pong(PING_BYTES.to_vec());
    }

    pub fn take_receiver(self) -> (PlayerRx, Player<WithoutRx>) {
        (
            self.receiver,
            Player::<WithoutRx> {
                id: self.id,
                username: self.username,
                sender: self.sender,
                receiver: (),
            },
        )
    }
}

fn joined_msg(new_player_name: &String) -> impl Serialize {
    use serde_json::json;
    json!({
        "kind": "joined",
        "payload": {
            "username": new_player_name,
        },
    })
}

fn start_msg(seed: Seed) -> impl Serialize {
    use serde_json::json;
    json!({
        "kind": "start",
        "payload": {
            "seed": seed,
        },
    })
}

impl<State> Debug for Player<State> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.id)
    }
}
