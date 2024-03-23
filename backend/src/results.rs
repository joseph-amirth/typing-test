use axum::{extract::Query, http::StatusCode, response::IntoResponse, Json};
use chrono::{serde::ts_milliseconds, DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::{auth::AuthToken, common::state::Db, typing_test::RandomTestParams};

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
) -> Result<Json<()>, PostResultError> {
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

    Ok(Json(()))
}

pub async fn get_results(
    db: Db,
    auth_token: AuthToken,
    Query(GetResultsParams { cursor, limit }): Query<GetResultsParams>,
) -> Result<Json<GetResultsResponse>, GetResultsError> {
    if limit == 0 {
        return Err(GetResultsError::NonPositiveLimit);
    }

    let (results_with_id, results_exhausted) = {
        let mut results_with_id = match cursor {
            Some(cursor) => sqlx::query_as!(
                    TestResultWithId,
                    "SELECT id, test_params, test_completed_timestamp, wpm, raw_wpm, accuracy FROM result WHERE user_id = ? AND id < ? ORDER BY id DESC LIMIT ?",
                    auth_token.user_id,
                    cursor,
                    limit + 1,
                )
                .fetch_all(&db)
                .await?,
            None => sqlx::query_as!(
                    TestResultWithId,
                    "SELECT id, test_params, test_completed_timestamp, wpm, raw_wpm, accuracy FROM result WHERE user_id = ? ORDER BY id DESC LIMIT ?",
                    auth_token.user_id,
                    limit + 1,
                )
                .fetch_all(&db)
                .await?,
        };

        let results_exhausted = results_with_id.len() < (limit + 1) as usize;
        if !results_exhausted {
            results_with_id.pop();
        }

        (results_with_id, results_exhausted)
    };

    let cursor = if results_exhausted {
        0
    } else {
        results_with_id.last().unwrap().id
    };

    let results = results_with_id
        .into_iter()
        .map(|result_with_id| result_with_id.into())
        .collect();

    Ok(Json(GetResultsResponse { cursor, results }))
}

impl From<serde_json::Error> for PostResultError {
    fn from(_error: serde_json::Error) -> Self {
        Self::Other
    }
}

impl From<sqlx::Error> for PostResultError {
    fn from(error: sqlx::Error) -> Self {
        if let sqlx::Error::Database(error) = error {
            let message = error.message();
            if message.starts_with("Duplicate entry")
                && message.ends_with("for key 'unique_result'")
            {
                return Self::DuplicateResult;
            }
        }
        Self::Other
    }
}

impl IntoResponse for PostResultError {
    fn into_response(self) -> axum::response::Response {
        match self {
            Self::DuplicateResult => (
                StatusCode::UNPROCESSABLE_ENTITY,
                "Duplicate result".to_string(),
            ),
            Self::Other => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal server error".to_string(),
            ),
        }
        .into_response()
    }
}

impl Into<TestResult> for TestResultWithId {
    fn into(self) -> TestResult {
        let TestResultWithId {
            test_params,
            test_completed_timestamp,
            wpm,
            raw_wpm,
            accuracy,
            ..
        } = self;
        TestResult {
            test_params,
            test_completed_timestamp,
            wpm,
            raw_wpm,
            accuracy,
        }
    }
}

impl IntoResponse for GetResultsError {
    fn into_response(self) -> axum::response::Response {
        match self {
            Self::NonPositiveLimit => (
                StatusCode::UNPROCESSABLE_ENTITY,
                "Limit should be a strictly positive integer",
            ),
            Self::Other => (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error"),
        }
        .into_response()
    }
}

impl From<sqlx::Error> for GetResultsError {
    fn from(_error: sqlx::Error) -> Self {
        Self::Other
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetResultsParams {
    cursor: Option<u32>,
    limit: u32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GetResultsResponse {
    cursor: u32,
    results: Vec<TestResult>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum GetResultsError {
    NonPositiveLimit,
    Other,
}

#[derive(Debug, Serialize)]
pub enum PostResultError {
    DuplicateResult,
    Other,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TestResult {
    test_params: RandomTestParams,

    #[serde(with = "ts_milliseconds")]
    test_completed_timestamp: DateTime<Utc>,

    wpm: f32,
    raw_wpm: f32,
    accuracy: f32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TestResultWithId {
    id: u32,

    test_params: RandomTestParams,

    #[serde(with = "ts_milliseconds")]
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
