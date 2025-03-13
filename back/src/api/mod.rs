pub mod membership;

use anyhow::Error;
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use thiserror;

#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("InternalError")]
    InternalError(#[from] Error),

    #[error("Unauthorized")]
    Unauthorized,

    #[error("ValidationError")]
    ValidationError,
}

impl From<sqlx::Error> for ApiError {
    fn from(err: sqlx::Error) -> Self {
        ApiError::InternalError(err.into())
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        match self {
            ApiError::InternalError(_) => (StatusCode::INTERNAL_SERVER_ERROR, "").into_response(),
            ApiError::ValidationError => (StatusCode::BAD_REQUEST, "").into_response(),
            ApiError::Unauthorized => (StatusCode::UNAUTHORIZED, "").into_response(),
        }
    }
}

pub type ApiResult<T> = Result<T, ApiError>;

//use uuid::Uuid;
//
// #[derive(Debug, sqlx::Type, sqlx::FromRow)]
// #[sqlx(transparent)]
// pub struct AccountId(Uuid);
//
// impl AccountId {
//     pub fn new() -> Self {
//         Self(Uuid::now_v7())
//     }
// }
//
//#[derive(Debug, /* sqlx::Type, */ /* sqlx::FromRow, */ async_graphql::NewType)]
// #[sqlx(transparent)]
//pub struct AccountToken(Uuid);
//
//impl AccountToken {
//    pub fn new() -> Self {
//        Self(Uuid::now_v7())
//    }
//}
