pub mod api;
pub mod configuration;

use api::dummy_api::*;
// use api::membership::*;
// use async_graphql::extensions::Tracing;
use async_graphql::{EmptySubscription, Object, Schema};
use async_graphql_axum::{GraphQLRequest, GraphQLResponse};
use axum::{extract::Extension, routing::post, serve::Serve, Router};
use configuration::Config;
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
// use std::sync::Arc;

pub struct App {
    addr: SocketAddr,
    server: Serve<Router, Router>,
}

impl App {
    pub fn addr(&self) -> SocketAddr {
        self.addr
    }

    pub async fn run_forever(self) {
        let _ = self.server.await;
    }

    pub async fn build(config: Config) -> App {
        // let pool = Arc::new(database::get_connection_pool(config.database).await);

        let schema = Schema::build(QueryRoot, MutationRoot, EmptySubscription)
            // .data(pool.clone())
            // .extension(Tracing)
            .finish();

        let router = Router::new()
            // .route("/healthz", get(healthz))
            // .route("/purchases", post(track_purchase))
            .route("/api", post(graphql_handler))
            // .layer(Extension(pool.clone()))
            // .layer(TraceLayer::new_for_http())
            .layer(CorsLayer::permissive())
            .layer(Extension(schema));

        let listener = tokio::net::TcpListener::bind(config.app.addr)
            .await
            .unwrap();
        let addr = listener.local_addr().unwrap();
        println!("listening on {}", addr);

        let server = axum::serve(listener, router);
        App { addr, server }
    }
}

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    async fn dummy(&self) -> DummyQuery {
        DummyQuery
    }
}

pub struct MutationRoot;

#[Object]
impl MutationRoot {
    async fn dummy(&self) -> DummyMutation {
        DummyMutation
    }
    // async fn membership(&self) -> MembershipMutation {
    //     MembershipMutation
    // }
}

type TSchema = Schema<QueryRoot, MutationRoot, EmptySubscription>;

async fn graphql_handler(schema: Extension<TSchema>, req: GraphQLRequest) -> GraphQLResponse {
    schema.execute(req.into_inner()).await.into()
}
