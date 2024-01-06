use axum::http::StatusCode;
use axum::{response::IntoResponse, Json};
use serde::{Deserialize, Serialize};

use super::AuthToken;
use crate::auth::password_hash;
use crate::common::state::Db;
use crate::preferences::Preferences;

pub async fn sign_up(
    db: Db,
    Json(SignUpParams {
        username,
        email,
        password,
        preferences,
    }): Json<SignUpParams>,
) -> Result<(AuthToken, Json<SignUpResponse>), SignUpError> {
    use validation::*;
    validate_username(&username)?;
    validate_email(&email)?;
    validate_password(&password)?;

    // TODO: Check that quality of randomness here is sufficient.
    let salt: Vec<u8> = (0..32).map(|_| rand::random()).collect();
    let password_hash = password_hash(&password, &salt);
    let preferences = preferences.to_string();

    let user_id = sqlx::query(
            "INSERT INTO user (username, email, salt, password_hash, preferences) VALUES (?, ?, ?, ?, ?)")
            .bind(username.to_owned())
            .bind(email.to_owned())
            .bind(salt)
            .bind(password_hash)
            .bind(preferences)
            .execute(&db).await?.last_insert_id() as u32;

    let auth_token = AuthToken::new(user_id, &username, &email);
    Ok((auth_token, Json(SignUpResponse { username, email })))
}

impl From<sqlx::Error> for SignUpError {
    fn from(error: sqlx::Error) -> Self {
        match error.as_database_error() {
            Some(database_error) => {
                let message = database_error.message();
                if !message.starts_with("Duplicate entry") {
                    return Self::Other;
                }
                if message.ends_with("for key 'username'") {
                    Self::UsernameTaken
                } else if message.ends_with("for key 'email'") {
                    Self::EmailTaken
                } else {
                    Self::Other
                }
            }
            None => Self::Other,
        }
    }
}

impl IntoResponse for SignUpError {
    fn into_response(self) -> axum::response::Response {
        let (status_code, body) = match self {
            Self::InvalidUsername(reason) => (
                StatusCode::UNPROCESSABLE_ENTITY,
                format!("Invalid username: {reason}"),
            ),
            Self::InvalidEmail => (
                StatusCode::UNPROCESSABLE_ENTITY,
                "Invalid email".to_string(),
            ),
            Self::InvalidPassword(reason) => (
                StatusCode::UNPROCESSABLE_ENTITY,
                format!("Invalid password: {reason}"),
            ),
            Self::UsernameTaken => (
                StatusCode::UNPROCESSABLE_ENTITY,
                "Username already taken".to_string(),
            ),
            Self::EmailTaken => (
                StatusCode::UNPROCESSABLE_ENTITY,
                "Email already in use".to_string(),
            ),
            Self::Other => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal server error".to_string(),
            ),
        };

        (status_code, body).into_response()
    }
}

#[derive(Debug, Deserialize)]
pub struct SignUpParams {
    username: String,
    email: String,
    password: String,
    preferences: Preferences,
}

#[derive(Debug, Serialize)]
pub struct SignUpResponse {
    username: String,
    email: String,
}

#[derive(Debug, Serialize)]
pub enum SignUpError {
    InvalidUsername(&'static str),
    InvalidEmail,
    InvalidPassword(&'static str),
    UsernameTaken,
    EmailTaken,
    Other,
}

mod validation {
    use lazy_static::lazy_static;
    use regex::Regex;

    use super::SignUpError;

    pub fn validate_username(username: &str) -> Result<(), SignUpError> {
        if username.len() < 6 {
            Err(SignUpError::InvalidUsername(
                "Username must be at least 6 characters long",
            ))
        } else if username.len() > 30 {
            Err(SignUpError::InvalidUsername(
                "Username must be at most 30 characters long",
            ))
        } else if username
            .chars()
            .any(|c| !c.is_ascii_alphanumeric() && c != '_' && c != '.')
        {
            Err(SignUpError::InvalidUsername(
                "Username must consist of only letters, digits, underscores and periods",
            ))
        } else {
            Ok(())
        }
    }

    lazy_static! {
        static ref RE_EMAIL: Regex = Regex::new(r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$").expect("no error");
    }

    pub fn validate_email(email: &str) -> Result<(), SignUpError> {
        if !RE_EMAIL.is_match(email) {
            Err(SignUpError::InvalidEmail)
        } else {
            Ok(())
        }
    }

    pub fn validate_password(password: &str) -> Result<(), SignUpError> {
        static SPECIAL_CHARS: &str = r###" !"#$%&'()*+,-./:;<=>?@[]\^_`{|}~"###;

        let mut is_valid = true;
        is_valid &= password.chars().any(|c| c.is_ascii_uppercase());
        is_valid &= password.chars().any(|c| c.is_ascii_lowercase());
        is_valid &= password.chars().any(|c| c.is_ascii_digit());
        is_valid &= password.chars().any(|c| SPECIAL_CHARS.contains(c));

        if password.len() < 8 {
            Err(SignUpError::InvalidPassword(
                "Password must be at least 8 characters long",
            ))
        } else if !is_valid {
            Err(SignUpError::InvalidPassword("Password must have at least one uppercase letter, one lowercase letter, one digit and one special character"))
        } else {
            Ok(())
        }
    }
}
