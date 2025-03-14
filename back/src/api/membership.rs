use crate::api::ApiResult;
use crate::app::{self};

use api_response_derive::ApiResponse;

use anyhow::Result;
use axum::{extract::State, response::Json};
use bcrypt::{hash, verify};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use utoipa::ToSchema;
use utoipa_axum::router::OpenApiRouter;
use utoipa_axum::routes;
use uuid::Uuid;

use super::ApiError;

pub fn router() -> OpenApiRouter<app::State> {
    OpenApiRouter::new()
        .routes(routes!(sign_up))
        .routes(routes!(sign_in))
}

// API

#[utoipa::path(
  post,
  path = "/sign-up",
  request_body = SignUpInput,
  responses(
    (status = OK, body = AuthenticatedResponse),
    //(status = BAD_REQUEST),
    (status = INTERNAL_SERVER_ERROR)))]
async fn sign_up(
    State(db): State<PgPool>,
    Json(input): Json<SignUpInput>,
) -> ApiResult<AuthenticatedResponse> {
    let mut tx = db.begin().await?;

    let result = async {
        let user = create_user(&mut tx, input.email, input.password)
            .await
            .map_err(|e| match e {
                UserCreationError::AlreadyExists => ApiError::ValidationError("exists".to_string()),
                UserCreationError::Error(e) => ApiError::InternalError(e),
            })?;
        let session_token = create_session(&mut tx, &user).await?;
        Ok(AuthenticatedResponse {
            token: session_token,
        })
    }
    .await;

    match &result {
        Ok(_) => tx.commit().await?,
        Err(_) => tx.rollback().await?,
    }

    result
}

#[utoipa::path(
  post,
  path = "/sign-in",
  request_body = SignUpInput,
  responses(
        (status = OK, body = AuthenticatedResponse)))]
async fn sign_in(
    State(db): State<PgPool>,
    Json(input): Json<SignUpInput>,
) -> ApiResult<AuthenticatedResponse> {
    let mut tx = db.begin().await?;

    let result = async {
        let user = get_user_by_email(&mut tx, &input.email)
            .await?
            .ok_or_else(|| ApiError::ValidationError("invalid_credential".to_string()))?;

        if !verify(input.password.as_ref(), user.hashed_password.as_ref())? {
            return Err(ApiError::ValidationError("invalid_credential".to_string()));
        }

        let session_token = create_session(&mut tx, &user).await?;
        Ok(AuthenticatedResponse {
            token: session_token,
        })
    }
    .await;

    match &result {
        Ok(_) => tx.commit().await?,
        Err(_) => tx.rollback().await?,
    }

    result
}

// ---

async fn create_user(
    transaction: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    email: Email,
    password: PlainTextPassword,
) -> Result<User, UserCreationError> {
    if get_user_by_email(transaction, &email).await?.is_some() {
        return Err(UserCreationError::AlreadyExists);
    }

    let user = User {
        id: UserId::new(),
        email,
        hashed_password: password.hash(),
    };

    sqlx::query("INSERT INTO \"user\" (id, email, hashed_password) VALUES ($1, $2, $3)")
        .bind(&user.id)
        .bind(&user.email)
        .bind(&user.hashed_password)
        .execute(&mut **transaction)
        .await?;

    //let account_id = AccountId::new();
    //let account_token = AccountToken::new();
    //
    //sqlx::query("INSERT INTO account (id, user_id, token) VALUES ($1, $2, $3)")
    //    .bind(account_id)
    //    .bind(&user.id)
    //    .bind(account_token)
    //    .execute(&mut **transaction)
    //    .await?;

    Ok(user)
}

pub enum UserCreationError {
    AlreadyExists,
    Error(anyhow::Error),
}

impl From<sqlx::Error> for UserCreationError {
    fn from(err: sqlx::Error) -> Self {
        UserCreationError::Error(err.into())
    }
}

impl From<anyhow::Error> for UserCreationError {
    fn from(err: anyhow::Error) -> Self {
        UserCreationError::Error(err)
    }
}

async fn get_user_by_email(
    transaction: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    email: &Email,
) -> Result<Option<User>> {
    let user = sqlx::query_as::<_, User>(
        "SELECT id, email, hashed_password FROM \"user\" WHERE email = $1::citext",
    )
    .bind(email)
    .fetch_optional(&mut **transaction)
    .await?;

    Ok(user)
}

async fn create_session(
    transaction: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    user: &User,
) -> Result<SessionToken> {
    let token = SessionToken::new();

    sqlx::query("INSERT INTO \"session\" (token, user_id) VALUES ($1, $2)")
        .bind(&token)
        .bind(&user.id)
        .execute(&mut **transaction)
        .await?;

    Ok(token)
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct SignUpInput {
    email: Email,
    password: PlainTextPassword,
}

#[derive(ApiResponse, Serialize, Deserialize, ToSchema)]
pub struct AuthenticatedResponse {
    token: SessionToken,
}

#[derive(Debug, sqlx::FromRow)]
struct User {
    pub id: UserId,
    pub email: Email,
    pub hashed_password: HashedPassword,
}

#[derive(Debug, sqlx::Type, sqlx::FromRow)]
#[sqlx(transparent)]
struct UserId(Uuid);

impl UserId {
    fn new() -> Self {
        Self(Uuid::now_v7())
    }
}

#[derive(Debug, Serialize, Deserialize, ToSchema, sqlx::Type, sqlx::FromRow)]
#[sqlx(transparent)]
pub struct Email(String);

#[derive(Serialize, Deserialize, ToSchema)]
pub struct PlainTextPassword(String);

impl PlainTextPassword {
    fn hash(&self) -> HashedPassword {
        HashedPassword(hash(&self.0, 4).unwrap())
    }
}
impl AsRef<str> for PlainTextPassword {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, sqlx::Type, sqlx::FromRow)]
#[sqlx(transparent)]
struct HashedPassword(String);

impl AsRef<str> for HashedPassword {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

#[derive(Serialize, Deserialize, ToSchema, sqlx::Type)]
#[sqlx(transparent)]
pub struct SessionToken(Uuid);

impl SessionToken {
    fn new() -> Self {
        Self(Uuid::now_v7())
    }
}

#[derive(Debug, sqlx::Type, sqlx::FromRow)]
#[sqlx(transparent)]
pub struct AccountId(Uuid);

impl AccountId {
    pub fn new() -> Self {
        Self(Uuid::now_v7())
    }
}
