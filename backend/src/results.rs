use axum::Json;
use chrono::{serde::ts_seconds, DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::{
    auth::AuthToken, common::error::AppError, common::state::Db, typing_test::RandomTestParams,
};

pub async fn post_result(
    db: Db,
    auth_token: AuthToken,
    Json(TestResult {
        test_params,
        test_completed_timestamp,
        wpm,
        raw_wpm,
        accuracy,
    }): Json<TestResult>,
) -> Result<(), AppError> {
    sqlx::query!(
        "INSERT INTO result (user_id, test_params, test_completed_timestamp, wpm, raw_wpm, accuracy) VALUES (?, ?, ?, ?, ?, ?)",
        auth_token.user_id,
        serde_json::to_string(&test_params)?,
        test_completed_timestamp,
        wpm,
        raw_wpm,
        accuracy,
    )
    .execute(&db)
    .await?;

    Ok(())
}

pub async fn get_results(db: Db, auth_token: AuthToken) -> Result<Json<Vec<TestResult>>, AppError> {
    let results = sqlx::query_as!(
        TestResult,
        "SELECT test_params, test_completed_timestamp, wpm, raw_wpm, accuracy FROM result WHERE user_id = ?",
        auth_token.user_id,
    )
    .fetch_all(&db)
    .await?;

    Ok(Json(results))
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TestResult {
    test_params: RandomTestParams,

    #[serde(with = "ts_seconds")]
    test_completed_timestamp: DateTime<Utc>,

    wpm: f32,
    raw_wpm: f32,
    accuracy: f32,
}

impl From<String> for RandomTestParams {
    fn from(test_result_json: String) -> Self {
        serde_json::from_str(&test_result_json).unwrap()
    }
}
