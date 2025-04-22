use crate::{
    api::membership,
    api::{Api, auth},
    configuration::Config,
    database,
};

use axum::{Router, extract::FromRef, middleware};
use sqlx::PgPool;
use std::sync::Arc;
use std::time::Duration;
use tokio::signal;
// use tokio::{signal, task};
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

        let public = Api::new()
            .procedure("membership/sign-up", membership::sign_up)
            .procedure("membership/sign-in", membership::sign_in)
            .build()
            .with_state(state.clone());

        let private = Api::new()
            .procedure("/membership/me", membership::me)
            .build()
            .layer(middleware::from_fn_with_state(
                state.clone(),
                auth::authorization,
            ))
            .with_state(state.clone());

        let app = Router::new().merge(public).merge(private).layer((
            CorsLayer::permissive(),
            TimeoutLayer::new(Duration::from_secs(10)),
        ));

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
