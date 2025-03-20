use crate::database;
use crate::{api::membership, configuration::Config};

use aide::swagger::Swagger;
use aide::{
    axum::{
        ApiRouter,
        routing::{get, post},
    },
    openapi::OpenApi,
};
use axum::{Extension, Json, extract::FromRef, middleware};
use sqlx::PgPool;
use std::sync::Arc;
use std::time::Duration;
use tokio::{signal, task};
use tower_http::cors::CorsLayer;
use tower_http::timeout::TimeoutLayer;

#[derive(Clone)]
pub struct State(Arc<InnerState>);

impl FromRef<State> for PgPool {
    fn from_ref(state: &State) -> Self {
        state.0.db.clone()
    }
}

pub struct InnerState {
    db: PgPool,
}

pub struct App {}

impl App {
    pub async fn run(config: Config) -> () {
        let pool = database::get_connection_pool(config.database).await;

        let state = State(Arc::new(InnerState { db: pool.clone() }));

        let mut api = OpenApi::default();

        aide::generate::infer_responses(false);

        let app = ApiRouter::new()
            .api_route("/membership/sign-up", post(membership::sign_up))
            .api_route("/membership/sign-in", post(membership::sign_in))
            .layer((
                CorsLayer::permissive(),
                TimeoutLayer::new(Duration::from_secs(10)),
            ))
            .with_state(state.clone())
            // swagger
            .route("/swagger", get(Swagger::new("/api.json").axum_handler()))
            .route(
                "/api.json",
                get(async |Extension(api): Extension<Arc<OpenApi>>| Json(api)),
            )
            .finish_api(&mut api)
            .layer(Extension(Arc::new(api)));

        let listener = tokio::net::TcpListener::bind(config.app.addr)
            .await
            .unwrap();

        let addr = listener.local_addr().unwrap();
        println!("listening on {}", addr);

        axum::serve(listener, app)
            .with_graceful_shutdown(shutdown_signal())
            .await
            .unwrap();

        //tokio::join!(
        //task::spawn({
        //    let pool = pool.clone();
        //    async move {
        //        shutdown_signal().await;
        //        underway::queue::graceful_shutdown(&pool).await.unwrap();
        //    }
        //}),
        //task::spawn(async move { job.run().await }),
        //    task::spawn(async move {
        //    })
        //);
    }
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}
