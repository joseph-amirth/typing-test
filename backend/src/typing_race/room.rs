use std::{collections::HashMap, time::Duration};

use axum::{
    extract::{
        ws::{Message, WebSocket},
        Query, State, WebSocketUpgrade,
    },
    response::IntoResponse,
    Json,
};
use futures::{
    future::{join, join_all},
    SinkExt, StreamExt,
};
use serde::{Deserialize, Serialize};
use tokio::sync::{
    mpsc::{self, Sender},
    oneshot,
};

use crate::{
    auth::AuthToken,
    common::{error::AppError, state::AppState},
};

use super::{Player, PlayerRx, PlayerTx};

pub async fn create_room(
    State(state): State<AppState>,
    _auth_token: AuthToken,
) -> Result<Json<CreateRoomResponse>, AppError> {
    let (tx, rx) = oneshot::channel();

    state
        .room_mgr()
        .send(RoomMgmtMsg::CreateRoom { responder: tx })
        .await?;

    let room_id = rx.await?;
    Ok(Json(CreateRoomResponse { room_id }))
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateRoomResponse {
    room_id: RoomId,
}

pub async fn join_room(
    State(state): State<AppState>,
    auth_token: AuthToken,
    ws: WebSocketUpgrade,
    Query(JoinRoomParams { room_id }): Query<JoinRoomParams>,
) -> impl IntoResponse {
    async fn handle_socket(
        state: AppState,
        auth_token: AuthToken,
        socket: WebSocket,
        room_id: RoomId,
    ) {
        let room_mgr = state.room_mgr();
        let player = Player::new(auth_token.user_id, auth_token.username, socket);
        room_mgr
            .send(RoomMgmtMsg::JoinRoom { room_id, player })
            .await
            .unwrap();
    }

    ws.on_upgrade(move |socket| handle_socket(state, auth_token, socket, room_id))
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JoinRoomParams {
    room_id: RoomId,
}

pub fn spawn_room_manager() -> RoomMgr {
    let (tx, mut rx) = mpsc::channel::<RoomMgmtMsg>(32);

    let self_tx = tx.clone();
    tokio::spawn(async move {
        let mut rooms = HashMap::<RoomId, Room>::new();

        while let Some(race_mgmt_msg) = rx.recv().await {
            match race_mgmt_msg {
                RoomMgmtMsg::CreateRoom { responder } => {
                    let room_id = rand::random();
                    let room = spawn_room(room_id, self_tx.clone());
                    rooms.insert(room_id, room);
                    responder.send(room_id).unwrap();
                }
                RoomMgmtMsg::JoinRoom { room_id, player } => {
                    let room = rooms.get(&room_id).unwrap();
                    room.send(RoomMsg::Join { player }).await.unwrap();
                }
                RoomMgmtMsg::DeleteRoom { room_id } => {
                    rooms.remove(&room_id).unwrap();
                }
            }
        }
    });

    tx
}

#[derive(Debug)]
pub enum RoomMgmtMsg {
    CreateRoom { responder: oneshot::Sender<RoomId> },
    JoinRoom { room_id: RoomId, player: Player },
    DeleteRoom { room_id: RoomId },
}

pub type RoomMgr = Sender<RoomMgmtMsg>;

fn spawn_room(id: RoomId, room_mgr: RoomMgr) -> Room {
    let (tx, mut rx) = mpsc::channel(32);

    let room_tx = tx.clone();
    tokio::spawn(async move {
        let mut player_ids = Vec::new();
        let mut player_usernames = Vec::new();
        let mut senders = Vec::new();
        let mut player_states = Vec::new();

        while let Some(room_msg) = rx.recv().await {
            dbg!(&room_msg);
            match room_msg {
                RoomMsg::Join { mut player } => {
                    let init_msg = serde_json::to_string(&ToPlayerMsg::Init {
                        other_player_usernames: &player_usernames,
                    })
                    .unwrap();
                    let join_msg = serde_json::to_string(&ToPlayerMsg::Join {
                        joining_player: &player.username,
                    })
                    .unwrap();

                    let new_player_future = player.sender.send(Message::Text(init_msg));
                    let other_player_futures = senders
                        .iter_mut()
                        .map(|sender: &mut PlayerTx| sender.send(Message::Text(join_msg.clone())));

                    let (_, other_player_results) =
                        join(new_player_future, join_all(other_player_futures)).await;
                    other_player_results.into_iter().for_each(Result::unwrap);

                    player_ids.push(player.id);
                    player_usernames.push(player.username);
                    senders.push(player.sender);
                    player_states.push(PlayerState::NotReady);

                    spawn_player_listener(player.id, room_tx.clone(), player.receiver);
                }
                RoomMsg::Ready { player_id } => {
                    let Some(player_idx) = player_ids.iter().position(|id| *id == player_id) else {
                        continue;
                    };
                    player_states[player_idx] = PlayerState::Ready;

                    let ready_msg = serde_json::to_string(&ToPlayerMsg::Ready {
                        ready_player: &player_usernames[player_idx],
                    })
                    .unwrap();

                    join_all(
                        senders
                            .iter_mut()
                            .enumerate()
                            .filter(|(i, _)| *i != player_idx)
                            .map(|(_, sender)| sender.send(Message::Text(ready_msg.clone()))),
                    )
                    .await
                    .into_iter()
                    .for_each(Result::unwrap);

                    if player_states
                        .iter()
                        .all(|player_state| *player_state == PlayerState::Ready)
                    {
                        let prepare_msg = serde_json::to_string(&ToPlayerMsg::Prepare {
                            time_until_race_start: Duration::from_secs(10),
                        })
                        .unwrap();
                        join_all(
                            senders
                                .iter_mut()
                                .map(|sender| sender.send(Message::Text(prepare_msg.clone()))),
                        )
                        .await
                        .into_iter()
                        .for_each(Result::unwrap);
                    }
                }
                RoomMsg::NotReady { player_id } => {
                    let Some(player_idx) = player_ids.iter().position(|id| *id == player_id) else {
                        continue;
                    };

                    // If all players are already ready, then it is too late to back out.
                    if player_states
                        .iter()
                        .all(|player_state| *player_state == PlayerState::Ready)
                    {
                        let error_msg = serde_json::to_string(&ToPlayerMsg::Error {
                            title: "Too late to back out!",
                            body: "The racing phase has begun, so you cannot back out now",
                        })
                        .unwrap();
                        let _ = senders[player_idx].send(Message::Text(error_msg)).await;
                        continue;
                    }

                    player_states[player_idx] = PlayerState::NotReady;

                    let not_ready_msg = serde_json::to_string(&ToPlayerMsg::NotReady {
                        not_ready_player: &player_usernames[player_idx],
                    })
                    .unwrap();

                    join_all(
                        senders
                            .iter_mut()
                            .enumerate()
                            .filter(|(i, _)| *i != player_idx)
                            .map(|(_, sender)| sender.send(Message::Text(not_ready_msg.clone()))),
                    )
                    .await
                    .into_iter()
                    .for_each(Result::unwrap);
                }
                RoomMsg::Leave { player_id } => {
                    let Some(index) = player_ids.iter().position(|id| *id == player_id) else {
                        continue;
                    };

                    let leave_msg = serde_json::to_string(&ToPlayerMsg::Leave {
                        leaving_player: &player_usernames[index],
                    })
                    .unwrap();

                    player_ids.remove(index);
                    player_usernames.remove(index);
                    let _ = senders.remove(index);
                    player_states.remove(index);

                    join_all(
                        senders
                            .iter_mut()
                            .map(|sender| sender.send(Message::Text(leave_msg.clone()))),
                    )
                    .await
                    .into_iter()
                    .for_each(Result::unwrap);
                }
                RoomMsg::Update {
                    player_id,
                    progress,
                } => {
                    let Some(player_idx) = player_ids.iter().position(|id| *id == player_id) else {
                        continue;
                    };

                    let update_msg = serde_json::to_string(&ToPlayerMsg::Update {
                        player: &player_usernames[player_idx],
                        progress,
                    })
                    .unwrap();

                    join_all(
                        senders
                            .iter_mut()
                            .enumerate()
                            .filter(|(i, _)| *i != player_idx)
                            .map(|(_, sender)| sender.send(Message::Text(update_msg.clone()))),
                    )
                    .await
                    .into_iter()
                    .for_each(Result::unwrap);
                }
                RoomMsg::Finish {
                    player_id,
                    duration,
                } => {
                    let Some(player_idx) = player_ids.iter().position(|id| *id == player_id) else {
                        continue;
                    };

                    let finish_msg = serde_json::to_string(&ToPlayerMsg::Finish {
                        player: &player_usernames[player_idx],
                        duration,
                    })
                    .unwrap();

                    join_all(
                        senders
                            .iter_mut()
                            .enumerate()
                            .filter(|(i, _)| *i != player_idx)
                            .map(|(_, sender)| sender.send(Message::Text(finish_msg.clone()))),
                    )
                    .await
                    .into_iter()
                    .for_each(Result::unwrap);
                }
            }
        }

        room_mgr
            .send(RoomMgmtMsg::DeleteRoom { room_id: id })
            .await
            .unwrap();
    });

    tx
}

fn spawn_player_listener(player_id: u32, room: Room, mut receiver: PlayerRx) {
    tokio::spawn(async move {
        while let Some(result) = receiver.next().await {
            let Ok(msg) = result else {
                continue;
            };
            let Message::Text(msg) = msg else {
                continue;
            };
            let msg: FromPlayerMsg = serde_json::from_str(msg.as_str()).unwrap();
            match msg {
                FromPlayerMsg::Ready {} => room.send(RoomMsg::Ready { player_id }).await.unwrap(),
                FromPlayerMsg::NotReady {} => {
                    room.send(RoomMsg::NotReady { player_id }).await.unwrap()
                }
                FromPlayerMsg::Update { progress } => {
                    room.send(RoomMsg::Update {
                        player_id,
                        progress,
                    })
                    .await
                    .unwrap();
                }
                FromPlayerMsg::Finish { duration } => {
                    room.send(RoomMsg::Finish {
                        player_id,
                        duration,
                    })
                    .await
                    .unwrap();
                }
            }
        }

        room.send(RoomMsg::Leave { player_id }).await.unwrap();
    });
}

pub type RoomId = u32;

type Room = Sender<RoomMsg>;

#[derive(Debug, PartialEq, Eq)]
enum PlayerState {
    NotReady,
    Ready,
}

#[derive(Debug)]
enum RoomMsg {
    Join { player: Player },
    Ready { player_id: u32 },
    NotReady { player_id: u32 },
    Leave { player_id: u32 },
    Update { player_id: u32, progress: u32 },
    Finish { player_id: u32, duration: Duration },
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
#[serde(rename_all_fields = "camelCase")]
#[serde(tag = "kind", content = "payload")]
enum ToPlayerMsg<'a> {
    /// Sent to players when they join the room.
    Init {
        other_player_usernames: &'a Vec<String>,
    },

    /// Sent to players when another player joins the room.
    Join { joining_player: &'a String },

    /// Sent to players when another player leaves the room.
    Leave { leaving_player: &'a String },

    /// Sent to players when another player becomes ready.
    Ready { ready_player: &'a String },

    /// Sent to players when another player becomes not ready.
    NotReady { not_ready_player: &'a String },

    /// Sent to players when all players are ready.
    Prepare { time_until_race_start: Duration },

    /// Sent to players when another player progresses in the race.
    Update { player: &'a String, progress: u32 },

    /// Sent to players when another player completes the race.
    Finish {
        player: &'a String,
        duration: Duration,
    },

    /// Sent to players when an error happens.
    Error { title: &'a str, body: &'a str },
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(rename_all_fields = "camelCase")]
#[serde(tag = "kind", content = "payload")]
enum FromPlayerMsg {
    Ready {},
    NotReady {},
    Update { progress: u32 },
    Finish { duration: Duration },
}
