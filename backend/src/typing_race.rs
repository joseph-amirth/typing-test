use std::{fmt::Debug, time::Duration};

use axum::{
    extract::{
        ws::{Message, WebSocket},
        State, WebSocketUpgrade,
    },
    response::IntoResponse,
};
use futures::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use tokio::{
    sync::mpsc::{self, Sender},
    time::sleep,
};

use crate::{auth::AuthToken, common::state::AppState};

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
    if !player.is_alive().await {
        return;
    }
    matchmaking.send(MmsMsg::Joined(player)).await.unwrap();
}

const PING_BYTES: [u8; 4] = [0, 1, 2, 3];

const TIME_UNTIL_EVICTION: Duration = Duration::from_secs(5);
const MAX_USERS_PER_LOBBY: usize = 5;

pub fn spawn_matchmaking_service() -> Sender<MmsMsg> {
    let (tx, mut rx) = mpsc::channel::<MmsMsg>(32);

    let tx_clone = tx.clone();
    tokio::spawn(async move {
        let mut lobby_id: u64 = rand::random();
        let mut lobby = Vec::<Player>::new();

        while let Some(mms_msg) = rx.recv().await {
            match mms_msg {
                MmsMsg::Joined(mut new_player) => {
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

pub enum MmsMsg {
    Joined(Player),
    Evict(u64),
}

async fn start_race(mut lobby: Vec<Player>) {
    let seed: i32 = rand::random();
    let start_msg = start_msg(seed);
    for player in &mut lobby {
        player.send(&start_msg).await;
    }

    let (tx, mut rx) = mpsc::channel::<RaceMsg>(32);

    let mut race = Vec::new();
    for player in lobby {
        let tx = tx.clone();
        let (player_tx, mut player_rx) = player.socket.split();
        race.push((player.username, player_tx));
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
            if username == &player.0 {
                continue;
            }
            let _ = player
                .1
                .send(Message::Text(
                    serde_json::to_string(&message).expect("no error"),
                ))
                .await;
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

pub struct Player {
    pub username: String,
    pub socket: WebSocket,
}

impl Player {
    pub fn new(username: String, socket: WebSocket) -> Self {
        Self { username, socket }
    }

    pub async fn send<T>(&mut self, message: &T)
    where
        T: Serialize,
    {
        self.socket
            .send(Message::Text(
                serde_json::to_string(&message).expect("no error"),
            ))
            .await
            .expect("no error");
    }

    pub async fn is_alive(&mut self) -> bool {
        if self
            .socket
            .send(Message::Ping(PING_BYTES.to_vec()))
            .await
            .is_err()
        {
            return false;
        }

        let Some(message) = self.socket.recv().await else {
            return false;
        };
        let Ok(message) = message else {
            return false;
        };
        return message == Message::Pong(PING_BYTES.to_vec());
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

fn start_msg(seed: i32) -> impl Serialize {
    use serde_json::json;
    json!({
        "kind": "start",
        "payload": {
            "seed": seed,
        },
    })
}

impl Debug for Player {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.username)
    }
}