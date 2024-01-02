use std::{
    convert::Infallible,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
    response::{IntoResponse, IntoResponseParts, Response},
    RequestPartsExt,
};
use axum_extra::extract::{
    cookie::{Cookie, SameSite},
    CookieJar,
};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation};
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

pub mod sign_up;
pub use sign_up::sign_up;

pub mod sign_in;
pub use sign_in::sign_in;

pub mod current_user;
pub use current_user::current_user;

pub mod log_out;
pub use log_out::log_out;

static KEYS: Lazy<Keys> = Lazy::new(|| {
    let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    Keys::new(jwt_secret.as_bytes())
});

pub fn password_hash(password: &str, salt: &Vec<u8>) -> Vec<u8> {
    static PEPPER: Lazy<String> =
        Lazy::new(|| std::env::var("PEPPER").expect("PEPPER must be set"));
    let mut hasher = Sha256::new();
    hasher.update(password);
    hasher.update(salt);
    hasher.update(&*PEPPER);
    hasher.finalize().to_vec()
}

pub async fn refresh_auth_token(
    mut auth_token: AuthToken,
    response: Response,
) -> impl IntoResponse {
    auth_token.refresh();
    (auth_token, response)
}

impl AuthToken {
    const VALIDITY_DURATION: Duration = Duration::from_secs(60 * 60 * 24 * 1); // 1 day
    const COOKIE_NAME: &'static str = "signintoken";

    fn new(user_id: u32, username: &str, email: &str) -> Self {
        let unix_time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("now to be after UNIX_EPOCH");
        let expiry_time = unix_time + Self::VALIDITY_DURATION;

        Self {
            exp: expiry_time.as_secs(),
            user_id,
            username: username.to_owned(),
            email: email.to_owned(),
        }
    }

    fn refresh(&mut self) {
        let unix_time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("now to be after UNIX_EPOCH");
        let expiry_time = unix_time + Self::VALIDITY_DURATION;
        self.exp = expiry_time.as_secs();
    }

    fn into_cookie(self) -> Cookie<'static> {
        let jwt = jsonwebtoken::encode(&Header::default(), &self, &KEYS.encoding)
            .expect("Default headers and algorithm used");
        let mut cookie = Cookie::new(Self::COOKIE_NAME, jwt);
        cookie.set_same_site(SameSite::Strict);
        cookie.set_secure(true);
        cookie.set_http_only(true);
        cookie
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
        let auth_token =
            jsonwebtoken::decode::<AuthToken>(jwt, &KEYS.decoding, &Validation::default())?.claims;

        Ok(auth_token)
    }
}

impl IntoResponseParts for AuthToken {
    type Error = Infallible;

    fn into_response_parts(
        self,
        res: axum::response::ResponseParts,
    ) -> Result<axum::response::ResponseParts, Self::Error> {
        let jar = CookieJar::new();
        let jar = jar.add(self.into_cookie());
        jar.into_response_parts(res)
    }
}

impl IntoResponse for AuthToken {
    fn into_response(self) -> Response {
        (self, ()).into_response()
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

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthToken {
    exp: u64,
    pub user_id: u32,
    pub username: String,
    pub email: String,
}

#[derive(Debug, Serialize)]
pub enum AuthTokenRejection {
    CookieNotFound,
    Expired,
    Other,
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
