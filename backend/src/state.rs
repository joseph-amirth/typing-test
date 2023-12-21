use std::{convert::Infallible, env};

use axum::{async_trait, extract::FromRequestParts, http::request::Parts};
use lettre::{transport::smtp::authentication::Credentials, AsyncSmtpTransport, Tokio1Executor};
use sqlx::{mysql::MySqlPoolOptions, MySqlPool};

pub type Mailer = AsyncSmtpTransport<Tokio1Executor>;

#[derive(Clone)]
pub struct AppState {
    pool: MySqlPool,
    mailer: Mailer,
}

impl AppState {
    pub async fn new() -> Self {
        Self {
            pool: Self::get_db_connection_pool().await,
            mailer: Self::get_smtp_mailer(),
        }
    }

    pub fn pool(&self) -> MySqlPool {
        self.pool.to_owned()
    }

    pub fn mailer(&self) -> Mailer {
        self.mailer.to_owned()
    }

    async fn get_db_connection_pool() -> MySqlPool {
        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

        let pool = MySqlPoolOptions::new()
            .max_connections(5)
            .connect(database_url.as_str())
            .await
            .expect("no error");

        pool
    }

    fn get_smtp_mailer() -> Mailer {
        let smtp_server = env::var("SMTP_SERVER").expect("SMTP_SERVER must be set");
        let smtp_port: u16 = env::var("SMTP_PORT")
            .expect("SMTP_PORT must be set")
            .parse()
            .expect("SMTP_PORT must be a valid port");
        let smtp_username = env::var("SMTP_USERNAME").expect("SMTP_USERNAME must be set");
        let smtp_password = env::var("SMTP_PASSWORD").expect("SMTP_PASSWORD must be set");

        let creds = Credentials::new(smtp_username.to_owned(), smtp_password.to_owned());

        let mailer = Mailer::relay(&smtp_server)
            .expect("no error")
            .port(smtp_port)
            .credentials(creds)
            .build();
        mailer
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
impl FromRequestParts<AppState> for MySqlPool {
    type Rejection = Infallible;

    async fn from_request_parts(
        _parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        Ok(state.pool.to_owned())
    }
}
