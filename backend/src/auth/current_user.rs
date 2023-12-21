use axum::Json;
use serde::Serialize;
use sqlx::MySqlPool;

use crate::{common::Preferences, utils::AppError};

use super::AuthToken;

pub async fn current_user(
    pool: MySqlPool,
    auth_token: AuthToken,
) -> Result<Json<CurrentUserResponse>, AppError> {
    let preferences_json: String = sqlx::query_scalar("SELECT preferences FROM user WHERE id = ?")
        .bind(auth_token.user_id)
        .fetch_one(&pool)
        .await?;
    let preferences = Preferences::from(preferences_json);

    Ok(Json(CurrentUserResponse {
        username: auth_token.username,
        email: auth_token.email,
        preferences,
    }))
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CurrentUserResponse {
    username: String,
    email: String,
    preferences: Preferences,
}
