pub mod membership;

use aide::{
    OperationOutput,
    generate::GenContext,
    openapi::{MediaType, Operation, Response},
    operation,
};
use anyhow;
use axum::response::{IntoResponse, Json};
use bcrypt;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::borrow::Cow;
use std::collections::{BTreeMap, HashMap, hash_map::Entry::Vacant};
use validator::{ValidationError, ValidationErrors};

#[derive(JsonSchema)]
pub struct MyValidationErrors(pub HashMap<Cow<'static, str>, MyValidationErrorsKind>);

#[derive(JsonSchema)]
pub struct MyValidationError {
    pub code: Cow<'static, str>,
    pub message: Option<Cow<'static, str>>,
    pub params: HashMap<Cow<'static, str>, Value>,
}

#[derive(JsonSchema)]
pub enum MyValidationErrorsKind {
    Struct(Box<MyValidationErrors>),
    List(BTreeMap<usize, Box<MyValidationErrors>>),
    Field(Vec<MyValidationError>),
}

#[derive(Debug)]
pub enum ApiError {
    ValidationError(ValidationErrors),

    Unauthorized,

    InternalError(anyhow::Error),
}

//pub fn global_validation_error(code: &str, message: Option<&str>) -> ValidationErrors {
//    let mut errors = ValidationErrors::new();
//
//    let mut error = ValidationError::new(code);
//
//    if let Some(msg) = message {
//        error.message = Some(msg.into());
//    }
//
//    // Insert under the "_global" key
//    errors.add("_global", error);
//
//    errors
//}
pub type ApiResult<T> = Result<T, ApiError>;

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
                    description: "Internal Server Error".into(),
                    ..Default::default()
                },
            ),
            (
                Some(400),
                Response {
                    description: "Bad Request".into(),
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
            (
                Some(422),
                aide::openapi::Response {
                    description: "Validation error".into(),
                    content: {
                        let mut content = indexmap::IndexMap::new();
                        content.insert(
                            "application/json".into(),
                            MediaType {
                                schema: Some(aide::openapi::SchemaObject {
                                    json_schema: schemars::schema::Schema::Object(
                                        ctx.schema
                                            .subschema_for::<MyValidationErrors>()
                                            .into_object(),
                                    ),
                                    external_docs: Default::default(),
                                    example: Default::default(),
                                }),
                                ..Default::default()
                            },
                        );
                        content
                    },
                    ..Default::default()
                },
            ),
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
            ApiError::ValidationError(e) => {
                (axum::http::StatusCode::BAD_REQUEST, Json(e)).into_response()
            }
            ApiError::Unauthorized => (axum::http::StatusCode::UNAUTHORIZED).into_response(),
        }
    }
}

pub fn ok<T: Serialize>(value: T) -> Result<Json<T>, ApiError> {
    Ok(Json(value))
}

////////
//use axum::extract::rejection::*;
//use axum::extract::{FromRequest, Request};
//use serde::de::DeserializeOwned;
//use validator::Validate;
//
//pub struct Valid<T>(pub T);
//
//impl<T, S> FromRequest<S> for Valid<T>
//where
//    T: DeserializeOwned,
//    S: Send + Sync,
//{
//    type Rejection = JsonRejection;
//
//    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
//        let Json(inner) = Json::<T>::from_request(req, state).await?;
//        Ok(Valid(inner))
//    }
//}
//
//use aide::OperationInput;
//
//impl<T> OperationInput for Valid<T>
//where
//    T: OperationInput + JsonSchema,
//{
//    fn operation_input(ctx: &mut aide::generate::GenContext, operation: &mut Operation) {
//        <T as OperationInput>::operation_input(ctx, operation);
//    }
//}
