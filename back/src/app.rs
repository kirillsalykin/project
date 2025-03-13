use crate::database;
use crate::{api::membership, configuration::Config};

use axum::{extract::FromRef, middleware};
use sqlx::PgPool;
use std::sync::Arc;
use std::time::Duration;
use tokio::{signal, task};
use tower_http::cors::CorsLayer;
use tower_http::timeout::TimeoutLayer;
use utoipa::OpenApi;
use utoipa_axum::router::OpenApiRouter;
use utoipa_swagger_ui::SwaggerUi;

use serde::{Deserialize, Serialize};

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

#[derive(OpenApi)]
struct ApiDoc;

pub struct App {}

impl App {
    pub async fn run(config: Config) -> () {
        let pool = database::get_connection_pool(config.database).await;

        let state = State(Arc::new(InnerState { db: pool.clone() }));

        let (router, api) = OpenApiRouter::with_openapi(ApiDoc::openapi())
            .nest("/membership", membership::router())
            .split_for_parts();

        let router = router
            .with_state(state.clone())
            .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", api))
            .layer((
                CorsLayer::permissive(),
                TimeoutLayer::new(Duration::from_secs(10)),
            ));

        let listener = tokio::net::TcpListener::bind(config.app.addr)
            .await
            .unwrap();
        let addr = listener.local_addr().unwrap();
        println!("listening on {}", addr);

        tokio::join!(
            //task::spawn({
            //    let pool = pool.clone();
            //    async move {
            //        shutdown_signal().await;
            //        underway::queue::graceful_shutdown(&pool).await.unwrap();
            //    }
            //}),
            //task::spawn(async move { job.run().await }),
            task::spawn(async move {
                axum::serve(listener, router)
                    .with_graceful_shutdown(shutdown_signal())
                    .await
            })
        );
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
