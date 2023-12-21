use axum_extra::extract::{cookie::Cookie, CookieJar};

use super::AuthToken;

pub async fn log_out(jar: CookieJar) -> CookieJar {
    jar.remove(Cookie::from(AuthToken::COOKIE_NAME))
}
