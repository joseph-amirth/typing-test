use axum::http::StatusCode;
use axum::{response::IntoResponse, Json};
use serde::{Deserialize, Serialize};
use sqlx::{MySqlPool, Row};

use crate::common::Preferences;

use super::AuthToken;

pub async fn sign_in(
    pool: MySqlPool,
    Json(SignInParams {
        username_or_email,
        password,
    }): Json<SignInParams>,
) -> Result<(AuthToken, Json<SignInResponse>), SignInError> {
    let row = match username_or_email {
        UsernameOrEmail::Email(email) => {
            sqlx::query("SELECT * FROM user WHERE email = ?")
                .bind(email.to_owned())
                .fetch_one(&pool)
                .await?
        }
        UsernameOrEmail::Username(username) => {
            sqlx::query("SELECT * FROM user WHERE username = ?")
                .bind(username.to_owned())
                .fetch_one(&pool)
                .await?
        }
    };

    let salt: Vec<u8> = row.get("salt");
    let password_hash: Vec<u8> = row.get("password_hash");
    let preferences: String = row.get("preferences");
    let preferences = Preferences::from(preferences);

    if super::password_hash(&password, &salt) != password_hash {
        return Err(SignInError::InvalidSignInParams);
    }

    let user_id = row.get("id");
    let username: String = row.get("username");
    let email: String = row.get("email");

    let auth_token: AuthToken = AuthToken::new(user_id, &username, &email);
    Ok((
        auth_token,
        Json(SignInResponse {
            username,
            email,
            preferences,
        }),
    ))
}

impl From<sqlx::Error> for SignInError {
    fn from(error: sqlx::Error) -> Self {
        if let sqlx::Error::RowNotFound = error {
            Self::InvalidSignInParams
        } else {
            Self::Other
        }
    }
}

impl IntoResponse for SignInError {
    fn into_response(self) -> axum::response::Response {
        let (status_code, body) = match self {
            Self::InvalidSignInParams => (
                StatusCode::UNPROCESSABLE_ENTITY,
                "Invalid username/email/password",
            ),
            Self::Other => (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error"),
        };

        (status_code, body).into_response()
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SignInParams {
    username_or_email: UsernameOrEmail,
    password: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SignInResponse {
    username: String,
    email: String,
    preferences: Preferences,
}

#[derive(Debug)]
pub enum SignInError {
    InvalidSignInParams,
    Other,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum UsernameOrEmail {
    Username(String),
    Email(String),
}
