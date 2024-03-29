use axum::handler::Handler;
use axum::http::header::CONTENT_TYPE;
use axum::http::{HeaderValue, Method};
use axum::middleware::map_response;
use axum::routing::{get, post};
use axum::Router;
use common::state::AppState;
use dotenv::dotenv;
use lettre::Message;
use tower_http::cors::CorsLayer;

mod auth;
mod common;

mod typing_race;
mod typing_test;

mod results;
use results::*;

mod preferences;
use preferences::*;

mod experimental;
use experimental::*;
use tower_http::trace::{DefaultMakeSpan, TraceLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[allow(dead_code)]
fn get_email() -> Result<Message, anyhow::Error> {
    let email = Message::builder()
        .from("Joseph <epicjoe128@gmail.com>".parse()?)
        .reply_to("Joseph <epicjoe128@gmail.com>".parse()?)
        .to("Joseph <epicjoe128@gmail.com>".parse()?)
        .subject("Test email")
        .body(String::from("Testing this"))?;
    Ok(email)
}

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "example_websockets=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    dotenv().ok();

    let app = Router::new()
        .route("/signup", post(auth::sign_up))
        .route("/signin", post(auth::sign_in))
        .route(
            "/current",
            get(auth::current_user.layer(map_response(auth::refresh_auth_token))),
        )
        .route("/logout", get(auth::log_out))
        .route("/result", get(get_results).post(post_result))
        .route("/stat", get(get_stats))
        .route("/prefs", post(update_preferences))
        .route("/race", get(typing_race::join_matchmaking))
        .route("/experimental", get(experimental))
        .with_state(AppState::new().await)
        .layer(
            CorsLayer::new()
                .allow_origin(
                    "http://localhost:3000"
                        .parse::<HeaderValue>()
                        .expect("no error"),
                )
                .allow_methods([Method::GET, Method::POST])
                .allow_headers([CONTENT_TYPE])
                .allow_credentials(true),
        )
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::default().include_headers(true)),
        );

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080")
        .await
        .expect("no error");
    tracing::debug!("Listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.expect("no error");
}
