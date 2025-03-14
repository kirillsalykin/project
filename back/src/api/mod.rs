pub mod membership;

use anyhow::Error;
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use bcrypt;
use thiserror;

#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("InternalError")]
    InternalError(#[from] Error),

    #[error("Unauthorized")]
    Unauthorized,

    #[error("ValidationError")]
    ValidationError(String),
}

impl From<sqlx::Error> for ApiError {
    fn from(err: sqlx::Error) -> Self {
        ApiError::InternalError(err.into())
    }
}

impl From<bcrypt::BcryptError> for ApiError {
    fn from(err: bcrypt::BcryptError) -> Self {
        ApiError::InternalError(err.into())
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        match self {
            ApiError::InternalError(_) => (StatusCode::INTERNAL_SERVER_ERROR, "").into_response(),
            ApiError::ValidationError(_) => (StatusCode::BAD_REQUEST, "").into_response(),
            ApiError::Unauthorized => (StatusCode::UNAUTHORIZED, "").into_response(),
        }
    }
}

pub type ApiResult<T> = Result<T, ApiError>;

// Example response
//{
//  "fieldErrors": {
//    "email": [
//      "Invalid email format",
//      "This email is already registered"
//    ],
//    "password": [
//      "Password must be at least 8 characters",
//      "Password must include at least one uppercase letter"
//    ]
//  },
//  "globalErrors": [
//    "Authentication failed",
//    "Server is in maintenance mode"
//  ]
//}
