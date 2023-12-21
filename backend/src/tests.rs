use axum::{extract::Path, Json};
use sqlx::MySqlPool;
use uuid::Uuid;

use crate::{common::SeededTestParams, utils::AppError};

pub async fn post_test(
    pool: MySqlPool,
    Json(seeded_test_params): Json<SeededTestParams>,
) -> Result<String, AppError> {
    let id = Uuid::new_v4().to_string();
    sqlx::query!(
        "INSERT INTO random_test VALUES (?, ?)",
        id,
        serde_json::to_string(&seeded_test_params).unwrap(),
    )
    .execute(&pool)
    .await?;

    Ok(id)
}

pub async fn get_test(
    pool: MySqlPool,
    Path(id): Path<String>,
) -> Result<Json<SeededTestParams>, AppError> {
    let seeded_test_params_json =
        sqlx::query_scalar!("SELECT params FROM random_test WHERE id = ?", id)
            .fetch_one(&pool)
            .await?;

    let seeded_test_params = serde_json::from_str(&seeded_test_params_json)?;
    Ok(Json(seeded_test_params))
}
