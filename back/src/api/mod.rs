pub mod auth;
pub mod membership;

use anyhow;
use axum::{
    Router,
    body::Body,
    extract::{FromRequest, FromRequestParts, Json},
    handler::Handler,
    http::Request,
    response::{IntoResponse, Response},
    routing::post,
};
use bcrypt;
use distilled::Distilled;
use serde::Serialize;
use serde_json::Value;
use std::{fmt::Debug, marker::PhantomData, pin::Pin};

pub struct Procedure<F, Extractors, Input, Output, Error> {
    f: F,
    _marker: PhantomData<(Extractors, Input, Output, Error)>,
}

impl<F, Extractors, Input, Output, Error> Clone for Procedure<F, Extractors, Input, Output, Error>
where
    F: Clone,
{
    fn clone(&self) -> Self {
        Procedure {
            f: self.f.clone(),
            _marker: PhantomData,
        }
    }
}
pub trait IntoProcedure<Extractors, Input, Output, Error> {
    type Procedure;
    fn into_procedure(self) -> Self::Procedure;
}

macro_rules! impl_procedure {
  ([$($ty:ident),* $(,)?] ) => {
        impl<F, Fut, $($ty,)* Input, Output, Error> IntoProcedure<( $($ty,)* ), Input, Output, Error>
        for F
        where
            F: FnOnce( $($ty,)* Input ) -> Fut + Clone + Send + Sync + 'static,
            Fut: Future<Output = Result<Output, Error>> + Send + 'static,
            Input: Distilled + Send + Sync + 'static,
            Output: Serialize + Send + Sync + 'static,
            Error: IntoResponse + Send + Sync + 'static,
        {
            type Procedure = Procedure<F, ( $( $ty, )* ), Input, Output, Error>;

            fn into_procedure(self) -> Self::Procedure {
                Procedure {
                    f: self,
                    _marker: PhantomData,
                }
            }
        }

        impl<F, Fut, S, $($ty,)* Input, Output, Error> Handler< (Input, $($ty,)* Output), S>
        for Procedure<F, ( $($ty,)* ), Input, Output, Error>
        where
            F: FnOnce( $( $ty, )* Input ) -> Fut + Clone + Send + Sync + 'static,
            Fut: Future<Output = Result<Output, Error>> + Send,
            S: Send + Sync + 'static,
            $( $ty: FromRequestParts<S> + Clone + Send + Sync + 'static, )*
            Input: Distilled + Send + Sync + 'static,
            Output: Serialize + Send + Sync + 'static,
            Error: IntoResponse + Send + Sync + 'static,
        {
            type Future = Pin<Box<dyn Future<Output = Response> + Send>>;

            fn call(self, req: Request<Body>, state: S) -> Self::Future {
                let (mut parts, body) = req.into_parts();

                Box::pin(async move {
                    $(
                        let $ty = match $ty::from_request_parts(&mut parts, &state).await {
                            Ok(value) => value,
                            Err(rejection) => return rejection.into_response(),
                        };
                    )*

                    let req = Request::from_parts(parts, body);

                    let input_value = match Json::<Value>::from_request(req, &state).await {
                        Ok(value) => value.0,
                        Err(rejection) => return rejection.into_response(),
                    };

                    let input: Input = match Input::distill(&input_value) {
                        Ok(input) => input,
                        Err(e) => { return ApiError::UnprocessableEntity(ValidationError::Fields(e)).into_response()
                        },
                    };

                    match (self.f)($($ty,)* input).await {
                      Ok(output) => Json::<Output>(output).into_response(),
                      Err(e) => e.into_response()
                    }
                })
            }
        }
    }
}

impl_procedure!([]);
impl_procedure!([T1]);
impl_procedure!([T1, T2]);

pub struct Api<S> {
    router: Router<S>,
}

impl<S> Api<S>
where
    S: Clone + Send + Sync + 'static,
{
    pub fn new() -> Self {
        Self {
            router: Router::<S>::new(),
        }
    }

    pub fn query<F, Extractors, Input, Output, Error, T: 'static>(
        mut self,
        name: &str,
        f: F,
    ) -> Self
    where
        F: IntoProcedure<Extractors, Input, Output, Error>,
        F::Procedure: Handler<T, S>,
        Input: Distilled,
        Output: Serialize,
        Error: IntoResponse,
    {
        self.router = self
            .router
            .route(&format!("/{}", name), post(f.into_procedure()));
        self
    }

    pub fn mutation<F, Extractors, Input, Output, Error, T: 'static>(
        mut self,
        name: &str,
        f: F,
    ) -> Self
    where
        F: IntoProcedure<Extractors, Input, Output, Error>,
        F::Procedure: Handler<T, S>,
        Input: Distilled,
        Output: Serialize,
        Error: IntoResponse,
    {
        self.router = self
            .router
            .route(&format!("/{}", name), post(f.into_procedure()));
        self
    }

    pub fn build(self) -> Router<S> {
        self.router
    }
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "data")]
pub enum ValidationError {
    #[serde(rename = "fields")]
    Fields(distilled::Error),

    #[serde(rename = "global")]
    Global(distilled::Error),
}

#[derive(Debug)]
pub enum ApiError {
    UnprocessableEntity(ValidationError),

    Unauthorized,

    InternalError(anyhow::Error),
}

impl ApiError {
    pub fn invalid(code: &'static str) -> ApiError {
        let error = distilled::Error::entry(code);
        ApiError::UnprocessableEntity(ValidationError::Global(error))
    }
}

pub type ApiResult<T> = Result<T, ApiError>;

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
            ApiError::UnprocessableEntity(e) => {
                (axum::http::StatusCode::UNPROCESSABLE_ENTITY, Json(e)).into_response()
            }
            ApiError::InternalError(_) => {
                (axum::http::StatusCode::INTERNAL_SERVER_ERROR).into_response()
            }
            ApiError::Unauthorized => (axum::http::StatusCode::UNAUTHORIZED).into_response(),
        }
    }
}
