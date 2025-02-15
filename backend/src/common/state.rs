use std::{convert::Infallible, env};

use axum::{async_trait, extract::FromRequestParts, http::request::Parts};
use lettre::{transport::smtp::authentication::Credentials, AsyncSmtpTransport, Tokio1Executor};
use sqlx::mysql::MySqlPoolOptions;

use crate::typing_race::{
    room::{spawn_room_manager, RoomMgr},
    spawn_matchmaking_service, Mms,
};

pub type Db = sqlx::MySqlPool;
pub type Mailer = AsyncSmtpTransport<Tokio1Executor>;

#[derive(Clone)]
pub struct AppState {
    db: Db,
    mailer: Mailer,
    matchmaking: Mms,
    room_mgr: RoomMgr,
}

impl AppState {
    pub async fn new() -> Self {
        Self {
            db: Self::get_db().await,
            mailer: Self::get_mailer(),
            matchmaking: spawn_matchmaking_service(),
            room_mgr: spawn_room_manager(),
        }
    }

    pub fn db(&self) -> Db {
        self.db.to_owned()
    }

    pub fn mailer(&self) -> Mailer {
        self.mailer.to_owned()
    }

    pub fn matchmaking(&self) -> Mms {
        self.matchmaking.clone()
    }

    pub fn room_mgr(&self) -> RoomMgr {
        self.room_mgr.clone()
    }

    async fn get_db() -> Db {
        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

        MySqlPoolOptions::new()
            .max_connections(5)
            .connect(database_url.as_str())
            .await
            .expect("no error")
    }

    fn get_mailer() -> Mailer {
        let smtp_server = env::var("SMTP_SERVER").expect("SMTP_SERVER must be set");
        let smtp_port: u16 = env::var("SMTP_PORT")
            .expect("SMTP_PORT must be set")
            .parse()
            .expect("SMTP_PORT must be a valid port");
        let smtp_username = env::var("SMTP_USERNAME").expect("SMTP_USERNAME must be set");
        let smtp_password = env::var("SMTP_PASSWORD").expect("SMTP_PASSWORD must be set");

        let creds = Credentials::new(smtp_username.to_owned(), smtp_password.to_owned());

        Mailer::relay(&smtp_server)
            .expect("no error")
            .port(smtp_port)
            .credentials(creds)
            .build()
    }
}

#[async_trait]
impl FromRequestParts<AppState> for Mailer {
    type Rejection = Infallible;

    async fn from_request_parts(
        _parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        Ok(state.mailer.to_owned())
    }
}

#[async_trait]
impl FromRequestParts<AppState> for Db {
    type Rejection = Infallible;

    async fn from_request_parts(
        _parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        Ok(state.db.to_owned())
    }
}
