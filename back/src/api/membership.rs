use crate::api::ApiResult;
use crate::app::{self};

use api_response_derive::ApiResponse;

use axum::{
    extract::Path,
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Json},
    Extension,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::PgPool;
use utoipa::ToSchema;
use utoipa_axum::router::OpenApiRouter;
use utoipa_axum::routes;
use uuid::Uuid;

pub fn router() -> OpenApiRouter<app::State> {
    OpenApiRouter::new().routes(routes!(sign_up))
    //.routes(routes!(sign_in))
}

#[utoipa::path(
  post,
  path = "/sign-up",
  request_body = SignUpInput,
  responses(
    (status = OK, body = SignUpResponse),
    (status = BAD_REQUEST),
    (status = INTERNAL_SERVER_ERROR)))]
async fn sign_up(
    State(db): State<PgPool>,
    Json(input): Json<SignUpInput>,
) -> ApiResult<SignUpResponse> {
    //let exists = sqlx::query_scalar("SELECT 1 FROM \"user\"")
    //    .fetch_one(&db)
    //    .await?;

    Ok(SignUpResponse {
        token: SessionToken::new(),
    })
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct SignUpInput {
    email: Email,
    password: PlainTextPassword,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct Email(String);

#[derive(Serialize, Deserialize, ToSchema)]
pub struct PlainTextPassword(String);

#[derive(ApiResponse, Serialize, Deserialize, ToSchema)]
pub struct SignUpResponse {
    token: SessionToken,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct SessionToken(Uuid);

impl SessionToken {
    fn new() -> Self {
        Self(Uuid::now_v7())
    }
}

#[derive(Serialize, Deserialize, ToSchema)]
struct SignUpError {}

//#[utoipa::path(
//  get,
//  path = "",
//  responses((status = OK, body = Vec<Campaign>)))]
//async fn sign_in(State(db): State<PgPool>) -> impl IntoResponse {
//    Json(campaigns)
//}
