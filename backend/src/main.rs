use std::env;
use std::net::SocketAddr;

use axum::http::{HeaderValue, Method};
use axum::routing::{get, post};
use axum::Router;
use dotenv::dotenv;
use http::header::CONTENT_TYPE;
use sqlx::mysql::MySqlPoolOptions;
use tower_http::cors::CorsLayer;

mod common;
mod utils;

mod tests;
use tests::*;

mod auth;
use auth::*;

mod results;
use results::*;

mod preferences;
use preferences::*;

mod experimental;
use experimental::*;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = MySqlPoolOptions::new()
        .max_connections(5)
        .connect(database_url.as_str())
        .await
        .unwrap();

    let unprotected_routes = Router::new()
        .route("/test/:id", get(get_test))
        .route("/test", post(post_test))
        .route("/result", get(get_results).post(post_result))
        .route("/signup", post(sign_up))
        .route("/signin", post(sign_in))
        .route("/current", get(current_user))
        .route("/logout", get(log_out))
        .route("/prefs", post(update_preferences))
        .route("/experimental", get(experimental));

    let protected_routes = Router::new();

    let app = Router::new()
        .merge(unprotected_routes)
        .merge(protected_routes)
        .with_state(pool)
        .layer(
            CorsLayer::new()
                .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
                .allow_methods([Method::GET, Method::POST])
                .allow_headers([CONTENT_TYPE])
                .allow_credentials(true),
        );

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("Listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
