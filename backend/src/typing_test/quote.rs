use std::{fs::File, io::BufReader};

use axum::{
    extract::{Path, Query},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use once_cell::sync::Lazy;
use rand::Rng;
use serde::{Deserialize, Serialize};

// TODO: Figure out if there is a way to do eager initialisation.
static QUOTES: Lazy<Vec<String>> = Lazy::new(|| {
    let file = File::open("quotes.json").expect("no error");
    let mut reader = BufReader::new(file);
    let quotes: Vec<String> = serde_json::from_reader(&mut reader).expect("no error");
    quotes
});

pub async fn get_random_quote(
    Query(GetRandomQuoteRequest { old_quote_id }): Query<GetRandomQuoteRequest>,
) -> Result<Json<GetRandomQuoteResponse>, GetRandomQuoteError> {
    let mut quote_id = rand::thread_rng().gen_range(0..QUOTES.len());
    if let Some(old_quote_id) = old_quote_id {
        while quote_id == old_quote_id {
            quote_id = rand::thread_rng().gen_range(0..QUOTES.len());
        }
    }

    Ok(Json(GetRandomQuoteResponse {
        quote_id,
        quote: QUOTES
            .get(quote_id)
            .ok_or(GetRandomQuoteError::Other)?
            .clone(),
    }))
}

pub async fn get_quote(Path(id): Path<usize>) -> Result<Json<GetQuoteResponse>, GetQuoteError> {
    let quote = QUOTES
        .get(id)
        .ok_or(GetQuoteError::InvalidQuoteId(id))?
        .clone();
    Ok(Json(GetQuoteResponse { quote }))
}

impl IntoResponse for GetRandomQuoteError {
    fn into_response(self) -> axum::response::Response {
        match self {
            Self::Other => (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error"),
        }
        .into_response()
    }
}

impl IntoResponse for GetQuoteError {
    fn into_response(self) -> axum::response::Response {
        match self {
            Self::InvalidQuoteId(id) => (
                StatusCode::UNPROCESSABLE_ENTITY,
                format!("Invalid quote id {} supplied", id),
            ),
        }
        .into_response()
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetRandomQuoteRequest {
    old_quote_id: Option<usize>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GetRandomQuoteResponse {
    quote_id: usize,
    quote: String,
}

#[derive(Debug, Serialize)]
pub enum GetRandomQuoteError {
    Other,
}

#[derive(Debug, Serialize)]
pub struct GetQuoteResponse {
    quote: String,
}

#[derive(Debug, Serialize)]
pub enum GetQuoteError {
    InvalidQuoteId(usize),
}
