use axum::Json;
use sqlx::MySqlPool;

use crate::{auth::AuthToken, common::Preferences, utils::AppError};

pub async fn update_preferences(
    pool: MySqlPool,
    auth_token: AuthToken,
    Json(preferences): Json<Preferences>,
) -> Result<(), AppError> {
    let preferences = preferences.to_string();
    sqlx::query("UPDATE user SET preferences = ? WHERE id = ?")
        .bind(preferences)
        .bind(auth_token.user_id)
        .execute(&pool)
        .await?;
    Ok(())
}
