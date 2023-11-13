use axum::{extract::State, Json};
use sqlx::MySqlPool;

use crate::{auth::AuthToken, common::Preferences, utils::AppError};

pub async fn update_preferences(
    State(pool): State<MySqlPool>,
    auth_token: AuthToken,
    Json(preferences): Json<Preferences>,
) -> Result<(), AppError> {
    sqlx::query!(
        "UPDATE user SET preferences = ? WHERE id = ?",
        serde_json::to_string(&preferences)?,
        auth_token.user_id,
    )
    .execute(&pool)
    .await?;

    Ok(())
}
