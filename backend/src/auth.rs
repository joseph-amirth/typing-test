use std::time::{Duration, SystemTime, UNIX_EPOCH};

use axum::{
    async_trait,
    extract::{FromRequestParts, State},
    http::{request::Parts, StatusCode},
    response::{IntoResponse, Redirect},
    Json, RequestPartsExt,
};
use axum_extra::extract::{
    cookie::{Cookie, SameSite},
    CookieJar,
};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation};
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use sqlx::MySqlPool;

use crate::common::Preferences;

static KEYS: Lazy<Keys> = Lazy::new(|| {
    let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    Keys::new(jwt_secret.as_bytes())
});

static PEPPER: Lazy<String> = Lazy::new(|| std::env::var("PEPPER").expect("PEPPER must be set"));

pub async fn sign_up(
    State(pool): State<MySqlPool>,
    jar: CookieJar,
    Json(SignUpParams {
        username,
        email,
        password,
        preferences,
    }): Json<SignUpParams>,
) -> Result<(CookieJar, Redirect), SignUpError> {
    // TODO: Verify that rand::random is cryptographically secure or replace with better RNG.
    let salt: Vec<u8> = (0..32).map(|_| rand::random()).collect();
    let password_hash = password_hash(&password, &salt);
    let preferences =
        serde_json::to_string(&preferences).expect("preferences can always be serialized");

    let user_id = sqlx::query!(
        "INSERT INTO user (username, email, salt, password_hash, preferences) VALUES (?, ?, ?, ?, ?)",
        username,
        email,
        salt,
        password_hash,
        preferences,
    )
    .execute(&pool)
    .await?
    .last_insert_id() as u32;

    let auth_token = AuthToken::new(user_id, username, email);
    let jar = jar.add(auth_token.into_cookie());
    Ok((jar, Redirect::to("/current")))
}

pub async fn sign_in(
    State(pool): State<MySqlPool>,
    jar: CookieJar,
    Json(SignInParams {
        id,
        password,
        preferences: _, // TODO: Update preferences on signing in with new preferences.
    }): Json<SignInParams>,
) -> Result<(CookieJar, Redirect), SignInError> {
    let auth_token = match id {
        Id::Username(username) => {
            let result = sqlx::query!(
                "SELECT id, email, salt, password_hash FROM user WHERE username = ?",
                username,
            )
            .fetch_one(&pool)
            .await?;

            if password_hash(&password, &result.salt) != result.password_hash {
                return Err(SignInError::InvalidSignInParams);
            }

            AuthToken::new(result.id, username, result.email)
        }
        Id::Email(email) => {
            let result = sqlx::query!(
                "SELECT id, username, salt, password_hash FROM user WHERE email = ?",
                email,
            )
            .fetch_one(&pool)
            .await?;

            if password_hash(&password, &result.salt) != result.password_hash {
                return Err(SignInError::InvalidSignInParams);
            }

            AuthToken::new(result.id, result.username, Some(email))
        }
    };

    let jar = jar.add(auth_token.into_cookie());
    Ok((jar, Redirect::to("/current")))
}

pub async fn current_user(
    State(pool): State<MySqlPool>,
    auth_token: AuthToken,
) -> Json<CurrentUserResponse> {
    let username = auth_token.username;
    let email = auth_token.email;
    let preferences_json = sqlx::query_scalar!(
        "SELECT preferences FROM user WHERE id = ?",
        auth_token.user_id,
    )
    .fetch_one(&pool)
    .await
    .expect("When user is created, this row is also created");

    Json(CurrentUserResponse {
        user_details: UserDetails { username, email },
        preferences: serde_json::from_str(&preferences_json).unwrap(),
    })
}

pub async fn log_out(jar: CookieJar) -> CookieJar {
    jar.remove(Cookie::named(AuthToken::COOKIE_NAME))
}

fn password_hash(password: &String, salt: &Vec<u8>) -> Vec<u8> {
    let mut hasher = Sha256::new();
    hasher.update(password);
    hasher.update(salt);
    hasher.update(&*PEPPER);
    hasher.finalize().to_vec()
}

impl From<sqlx::Error> for SignUpError {
    fn from(error: sqlx::Error) -> Self {
        match error.as_database_error() {
            Some(error) => {
                let message = error.message();
                if !message.starts_with("Duplicate entry") {
                    return SignUpError::Other;
                }
                if message.ends_with("for key 'username'") {
                    SignUpError::UsernameNotUnique
                } else if message.ends_with("for key 'email'") {
                    SignUpError::EmailNotUnique
                } else {
                    SignUpError::Other
                }
            }
            None => SignUpError::Other,
        }
    }
}

impl IntoResponse for SignUpError {
    fn into_response(self) -> axum::response::Response {
        let (status_code, body) = match self {
            Self::UsernameNotUnique => (StatusCode::UNPROCESSABLE_ENTITY, "Username already taken"),
            Self::EmailNotUnique => (StatusCode::UNPROCESSABLE_ENTITY, "Email already in use"),
            Self::Other => (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error"),
        };

        (status_code, body).into_response()
    }
}

impl From<sqlx::Error> for SignInError {
    fn from(error: sqlx::Error) -> Self {
        if error.to_string()
            == "no rows returned by a query that expected to return at least one row"
        {
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

impl AuthToken {
    const VALIDITY_DURATION: Duration = Duration::from_secs(60 * 60 * 24 * 1); // 1 day
    const COOKIE_NAME: &'static str = "signintoken";

    fn new(user_id: u32, username: String, email: Option<String>) -> Self {
        let unix_time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
        let expiry_time = unix_time + Self::VALIDITY_DURATION;

        Self {
            exp: expiry_time.as_secs(),
            user_id,
            username,
            email,
        }
    }

    fn refresh(&mut self) {
        let unix_time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
        let expiry_time = unix_time + Self::VALIDITY_DURATION;
        self.exp = expiry_time.as_secs();
    }

    fn into_cookie(self) -> Cookie<'static> {
        let jwt = jsonwebtoken::encode(&Header::default(), &self, &KEYS.encoding)
            .expect("Default headers and algorithm used");
        Cookie::build(Self::COOKIE_NAME, jwt)
            .same_site(SameSite::Strict)
            .secure(true)
            .http_only(true)
            .finish()
    }
}

#[async_trait]
impl<S> FromRequestParts<S> for AuthToken
where
    S: Send + Sync,
{
    type Rejection = AuthTokenRejection;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let jar = parts
            .extract::<CookieJar>()
            .await
            .expect("CookeiJar is an infallible extractor");
        let cookie = jar
            .get(Self::COOKIE_NAME)
            .ok_or(AuthTokenRejection::CookieNotFound)?;

        let jwt = cookie.value();
        let mut auth_token =
            jsonwebtoken::decode::<AuthToken>(jwt, &KEYS.decoding, &Validation::default())?.claims;

        // TODO: Write middleware that adds the refreshed auth token to cookies.
        auth_token.refresh();
        Ok(auth_token)
    }
}

impl From<jsonwebtoken::errors::Error> for AuthTokenRejection {
    fn from(error: jsonwebtoken::errors::Error) -> Self {
        use jsonwebtoken::errors::ErrorKind;

        match error.kind() {
            ErrorKind::ExpiredSignature => Self::Expired,
            _ => Self::Other,
        }
    }
}

impl IntoResponse for AuthTokenRejection {
    fn into_response(self) -> axum::response::Response {
        let (status_code, body) = match self {
            Self::CookieNotFound => (StatusCode::UNPROCESSABLE_ENTITY, "Sign in JWT not found"),
            Self::Expired => (StatusCode::UNPROCESSABLE_ENTITY, "Sign in JWT expired"),
            Self::Other => (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error"),
        };
        (status_code, body).into_response()
    }
}

#[derive(Debug, Deserialize)]
pub struct SignUpParams {
    username: String,
    email: Option<String>,
    password: String,
    preferences: Preferences,
}

#[derive(Debug, Serialize)]
pub enum SignUpError {
    UsernameNotUnique,
    EmailNotUnique,
    Other,
}

#[derive(Debug, Deserialize)]
pub struct SignInParams {
    id: Id,
    password: String,
    preferences: Preferences,
}

#[derive(Debug, Serialize)]
pub struct SignInResponse(UserDetails);

#[derive(Debug, Serialize)]
pub enum SignInError {
    InvalidSignInParams,
    Other,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Id {
    Username(String),
    Email(String),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthToken {
    exp: u64,
    pub user_id: u32,
    pub username: String,
    pub email: Option<String>,
}

#[derive(Debug, Serialize)]
pub enum AuthTokenRejection {
    CookieNotFound,
    Expired,
    Other,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CurrentUserResponse {
    pub user_details: UserDetails,
    pub preferences: Preferences,
}

#[derive(Debug, Serialize)]
pub struct CurrentUserError;

#[derive(Debug, Serialize)]
pub struct UserDetails {
    pub username: String,
    pub email: Option<String>,
}

struct Keys {
    encoding: EncodingKey,
    decoding: DecodingKey,
}

impl Keys {
    fn new(jwt_secret: &[u8]) -> Self {
        Self {
            encoding: EncodingKey::from_secret(jwt_secret),
            decoding: DecodingKey::from_secret(jwt_secret),
        }
    }
}
