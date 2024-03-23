use axum::Json;
use serde::{Deserialize, Serialize};

use crate::{
    auth::AuthToken,
    common::{error::AppError, state::Db},
};

pub async fn update_preferences(
    db: Db,
    auth_token: AuthToken,
    Json(preferences): Json<Preferences>,
) -> Result<Json<()>, AppError> {
    let preferences = preferences.to_string();
    sqlx::query("UPDATE user SET preferences = ? WHERE id = ?")
        .bind(preferences)
        .bind(auth_token.user_id)
        .execute(&db)
        .await?;
    Ok(Json(()))
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Preferences {
    current_mode: TypingTestMode,
    words_mode_length: u32,
    time_mode_duration: u32,
    language: Language,
    quote_mode_length: QuoteModeLength,
    max_chars_in_line: u32,
    show_all_lines: bool,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TypingTestMode {
    Words,
    Time,
    Quote,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Language {
    English,
    English1k,
    English5k,
    English10k,
    English25k,
    English450k,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum QuoteModeLength {
    Short,
    Medium,
    Long,
    VeryLong,
    All,
}

impl From<String> for Preferences {
    fn from(value: String) -> Self {
        serde_json::from_str(&value).expect("no error")
    }
}

impl ToString for Preferences {
    fn to_string(&self) -> String {
        serde_json::to_string(&self).expect("no error")
    }
}
