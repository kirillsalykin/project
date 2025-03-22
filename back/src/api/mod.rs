pub mod membership;

use aide::{
    OperationOutput,
    generate::GenContext,
    openapi::{MediaType, Operation, Response},
};
use anyhow;
use axum::response::{IntoResponse, Json};
use bcrypt;
use schemars::JsonSchema;
use serde_json::Value;
use std::borrow::Cow;
use std::collections::{BTreeMap, HashMap};
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

impl ApiError {
    pub fn invalid(code: &'static str) -> ApiError {
        let mut errors = ValidationErrors::new();

        let error = ValidationError::new(code);

        errors.add("_global", error);

        ApiError::ValidationError(errors)
    }
}

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
            ApiError::ValidationError(e) => {
                (axum::http::StatusCode::UNPROCESSABLE_ENTITY, Json(e)).into_response()
            }
            ApiError::InternalError(_) => {
                (axum::http::StatusCode::INTERNAL_SERVER_ERROR).into_response()
            }
            ApiError::Unauthorized => (axum::http::StatusCode::UNAUTHORIZED).into_response(),
        }
    }
}
