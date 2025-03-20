pub mod membership;

use aide::{
    OperationOutput,
    generate::GenContext,
    openapi::MediaType,
    openapi::{Operation, Response},
};
use anyhow;
use axum::response::{IntoResponse, Json};
use bcrypt;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug)]
pub enum ApiError {
    InternalError(anyhow::Error),

    Unauthorized,
    //ValidationError(ValidationErrorInfo),
}

impl OperationOutput for ApiError {
    type Inner = Self;

    fn inferred_responses(
        ctx: &mut GenContext,
        _operation: &mut Operation,
    ) -> Vec<(Option<u16>, Response)> {
        vec![
            (
                Some(500),
                Response {
                    description: "Internal server error".into(),
                    ..Default::default()
                },
            ),
            (
                Some(401),
                Response {
                    description: "Unauthorized".into(),
                    ..Default::default()
                },
            ),
            //(
            //    Some(400),
            //    aide::openapi::Response {
            //        description: "Validation error".into(),
            //        content: {
            //            let mut content = indexmap::IndexMap::new();
            //            content.insert(
            //                "application/json".into(),
            //                MediaType {
            //                    schema: Some(aide::openapi::SchemaObject {
            //                        json_schema: schemars::schema::Schema::Object(
            //                            ctx.schema
            //                                .subschema_for::<ValidationErrorInfo>()
            //                                .into_object(),
            //                        ),
            //                        external_docs: Default::default(),
            //                        example: Default::default(),
            //                    }),
            //                    ..Default::default()
            //                },
            //            );
            //            content
            //        },
            //        ..Default::default()
            //    },
            //),
        ]
    }
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
    fn into_response(self) -> axum::response::Response {
        match self {
            ApiError::InternalError(_) => {
                (axum::http::StatusCode::INTERNAL_SERVER_ERROR).into_response()
            }
            //ApiError::ValidationError(e) => {
            //    (axum::http::StatusCode::BAD_REQUEST, Json(e)).into_response()
            //}
            ApiError::Unauthorized => (axum::http::StatusCode::UNAUTHORIZED).into_response(),
        }
    }
}

pub type ApiResult<T> = Result<T, ApiError>;

pub fn ok<T: Serialize>(value: T) -> Result<Json<T>, ApiError> {
    Ok(Json(value))
}
