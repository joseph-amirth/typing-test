use axum::Json;
use axum_extra::extract::{
    cookie::{Cookie, SameSite},
    CookieJar,
};
use serde::Serialize;

use super::AuthToken;

pub async fn log_out(jar: CookieJar) -> (CookieJar, Json<LogOutResponse>) {
    let mut cookie = Cookie::from(AuthToken::COOKIE_NAME);
    cookie.set_same_site(SameSite::Strict);
    (jar.remove(cookie), Json(LogOutResponse))
}

#[derive(Debug, Serialize)]
pub struct LogOutResponse;
