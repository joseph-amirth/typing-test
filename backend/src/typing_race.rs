use std::{fmt::Debug, time::Duration};

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

pub fn spawn_matchmaking_service() -> Sender<MmsMsg> {
    let (tx, mut rx) = mpsc::channel::<MmsMsg>(32);

    let tx_clone = tx.clone();
    tokio::spawn(async move {
        let mut lobby_id: u64 = rand::random();
        let mut lobby = Vec::<Player<WithRx>>::new();

        while let Some(mms_msg) = rx.recv().await {
            match mms_msg {
                MmsMsg::Join {
                    player: mut new_player,
                    responder,
                } => {
                    responder.send(Ok(())).unwrap();
                    for player in &mut lobby {
                        player.send(&joined_msg(&new_player.username)).await;
                        new_player.send(&joined_msg(&player.username)).await;
                    }
                    lobby.push(new_player);
                    if lobby.len() == 2 {
                        let tx_clone = tx_clone.clone();
                        tokio::spawn(async move {
                            sleep(TIME_UNTIL_EVICTION).await;
                            tx_clone.send(MmsMsg::Evict(lobby_id)).await.unwrap();
                        });
                    }

                    if lobby.len() == MAX_USERS_PER_LOBBY {
                        tokio::spawn(start_race(lobby.drain(..).collect()));
                        lobby_id = rand::random();
                    }
                }
                MmsMsg::Evict(id) => {
                    if id == lobby_id {
                        tokio::spawn(start_race(lobby.drain(..).collect()));
                    }
                }
            }
        }
    });

    tx
}

type Responder<T> = oneshot::Sender<Result<T, MmsError>>;

#[derive(Debug)]
pub enum MmsMsg {
    Join {
        player: Player<WithRx>,
        responder: Responder<()>,
    },
    Evict(u64),
}

#[derive(Debug)]
pub enum MmsError {
    JoinError(Player),
}

async fn start_race(mut lobby: Vec<Player<WithRx>>) {
    let seed: Seed = rand::random();
    let start_msg = start_msg(seed);
    for player in &mut lobby {
        player.send(&start_msg).await;
    }

    let (tx, mut rx) = mpsc::channel::<RaceMsg>(32);

    let mut race = Vec::new();
    for player in lobby {
        let tx = tx.clone();
        let (mut player_rx, player) = player.take_receiver();
        race.push(player);
        tokio::spawn(async move {
            while let Some(Ok(message)) = player_rx.next().await {
                match message {
                    Message::Text(message) => {
                        let race_msg = serde_json::from_str(&message).expect("no error");
                        tx.send(race_msg).await.unwrap();
                    }
                    Message::Close(_) => {
                        return;
                    }
                    _ => {}
                }
            }
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
            let _ = player.send(&message).await;
        }
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
    pub async fn send<T>(&mut self, message: &T)
    where
        T: Serialize,
    {
        self.sender
            .send(Message::Text(
                serde_json::to_string(&message).expect("no error"),
            ))
            .await
            .expect("no error");
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
