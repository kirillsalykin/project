pub mod membership;

use anyhow::Error;
use axum::{
    http::StatusCode,
    response::{IntoResponse, Json, Response},
};
use bcrypt;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use utoipa::ToSchema;

// TODO: implement https://chatgpt.com/c/67d51839-67a8-8009-988b-acef44d9756a

#[derive(Debug)]
pub enum ApiError {
    InternalError(Error),

    Unauthorized,

    ValidationError(ValidationErrorInfo),
}

impl ApiError {
    pub fn invalid<S: Into<String>>(error: S) -> Self {
        ApiError::ValidationError(ValidationErrorInfo {
            error: Some(error.into()),
            field_errors: None,
        })
    }

    pub fn invalid_with_fields<S: Into<String>>(msg: S, fields: HashMap<String, String>) -> Self {
        ApiError::ValidationError(ValidationErrorInfo {
            error: Some(msg.into()),
            field_errors: Some(fields),
        })
    }
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ValidationErrorInfo {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    #[serde(rename = "fieldErrors", skip_serializing_if = "Option::is_none")]
    pub field_errors: Option<HashMap<String, String>>,
}

impl From<anyhow::Error> for ApiError {
    fn from(err: anyhow::Error) -> Self {
        ApiError::InternalError(err)
    }
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
            ApiError::ValidationError(e) => (StatusCode::BAD_REQUEST, Json(e)).into_response(),
            ApiError::Unauthorized => (StatusCode::UNAUTHORIZED, "").into_response(),
        }
    }
}

pub type ApiResult<T> = Result<T, ApiError>;
