use axum_extra::extract::{
    cookie::{Cookie, SameSite},
    CookieJar,
};

use super::AuthToken;

pub async fn log_out(jar: CookieJar) -> CookieJar {
    let mut cookie = Cookie::from(AuthToken::COOKIE_NAME);
    cookie.set_same_site(SameSite::Strict);
    jar.remove(cookie)
}
