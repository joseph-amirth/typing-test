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

pub async fn join_matchmaking(
    State(state): State<AppState>,
    auth_token: AuthToken,
    ws: WebSocketUpgrade,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(state, auth_token, socket))
}

async fn handle_socket(state: AppState, auth_token: AuthToken, socket: WebSocket) {
    let matchmaking = state.matchmaking();
    let username = auth_token.username;
    let mut player = Player::new(username, socket);
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

pub fn spawn_matchmaking_service() -> Mms {
    let (tx, mut rx) = mpsc::channel::<MmsMsg>(32);

    let self_tx = tx.clone();
    tokio::spawn(async move {
        let mut lobby_id: u32 = 0;
        let mut lobby = Vec::<Player>::new();
        let mut players = BTreeMap::<String, u32>::new();

        while let Some(mms_msg) = rx.recv().await {
            match mms_msg {
                MmsMsg::Join {
                    player: mut new_player,
                    responder,
                } => {
                    if players.get(&new_player.username).is_some() {
                        responder
                            .send(Err(MmsError::JoinError(new_player)))
                            .unwrap();
                        continue;
                    }

                    responder.send(Ok(())).unwrap();
                    players.insert(new_player.username.clone(), lobby_id);
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
                MmsMsg::Leave { username, lobby_id } => {
                    if players.get(&username) == Some(&lobby_id) {
                        players.remove(&username);
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
        username: String,
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

    let (tx, mut rx) = mpsc::channel::<RaceMsg>(32);

    let mut race = Vec::new();
    for player in lobby {
        let tx = tx.clone();
        let mms = mms.clone();
        let (mut player_rx, player) = player.take_receiver();
        let username = player.username.clone();
        race.push(player);
        tokio::spawn(async move {
            while let Some(Ok(message)) = player_rx.next().await {
                match message {
                    Message::Text(message) => {
                        let race_msg = serde_json::from_str(&message).expect("no error");
                        tx.send(race_msg).await.unwrap();
                    }
                    Message::Close(_) => {
                        break;
                    }
                    _ => {}
                }
            }
            mms.send(MmsMsg::Leave { username, lobby_id })
                .await
                .unwrap();
        });
    }

    // Doing this lets the channel close automatically once all the players' websocket connections
    // have closed.
    drop(tx);

    while let Some(message) = rx.recv().await {
        let username = message.username();
        for player in &mut race {
            if username == &player.username {
                continue;
            }
            player.send(&message).await.unwrap();
        }
    }

    for player in race {
        mms.send(MmsMsg::Leave {
            username: player.username,
            lobby_id,
        })
        .await
        .unwrap();
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(rename_all_fields = "camelCase")]
#[serde(tag = "kind", content = "payload")]
enum RaceMsg {
    Update { username: String, progress: usize },
    Finish { username: String, result: f32 },
}

impl RaceMsg {
    fn username(&self) -> &String {
        match self {
            Self::Update { username, .. } => &username,
            Self::Finish { username, .. } => &username,
        }
    }
}

type PlayerTx = SplitSink<WebSocket, Message>;
type PlayerRx = SplitStream<WebSocket>;

type WithRx = PlayerRx;
type WithoutRx = ();

pub struct Player<Rx = WithRx> {
    pub username: String,
    pub sender: PlayerTx,
    receiver: Rx,
}

impl Player {
    fn new(username: String, socket: WebSocket) -> Self {
        let (sender, receiver) = socket.split();
        Self {
            username,
            sender,
            receiver,
        }
    }
}

impl<Rx> Player<Rx> {
    pub async fn send<T>(&mut self, message: &T) -> Result<(), axum::Error>
    where
        T: Serialize,
    {
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
        write!(f, "{}", self.username)
    }
}
