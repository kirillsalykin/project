use crate::api::{ApiError, ApiResult};

use anyhow::Result;
use axum::{Extension, extract::State};
use bcrypt::{hash, verify};
use distilled::{Distilled, Error};
use serde::Serialize;
use sqlx::PgPool;
use std::convert::TryFrom;
use uuid::Uuid;

// API
pub async fn sign_up(
    State(db): State<PgPool>,
    input: SignUpInput,
) -> ApiResult<AuthenticatedOutput> {
    let mut tx = db.begin().await?;

    let result = async {
        let user = create_user(&mut tx, input.email, input.password)
            .await
            .map_err(|e| match e {
                UserCreationError::AlreadyExists => ApiError::invalid("already_exists"),
                UserCreationError::Error(e) => ApiError::InternalError(e),
            })?;
        let session_token = create_session(&mut tx, &user).await?;
        Ok(AuthenticatedOutput {
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

pub async fn sign_in(
    State(db): State<PgPool>,
    input: SignUpInput,
) -> ApiResult<AuthenticatedOutput> {
    let mut tx = db.begin().await?;

    let result = async {
        let user = get_user_by_email(&mut tx, &input.email)
            .await?
            .ok_or_else(|| ApiError::invalid("invalid_credentials"))?;

        if !verify(input.password.as_ref(), user.hashed_password.as_ref())? {
            return Err(ApiError::invalid("invalid_credentials"));
        }

        let session_token = create_session(&mut tx, &user).await?;
        Ok(AuthenticatedOutput {
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

pub async fn me(Extension(user): Extension<User>, _input: ()) -> ApiResult<MeOutput> {
    Ok(user.into())
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

// TODO: map to ApiError?
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

#[derive(Debug, Distilled)]
pub struct SignUpInput {
    email: Email,
    password: PlainTextPassword,
}

#[derive(Serialize)]
pub struct AuthenticatedOutput {
    token: SessionToken,
}

#[derive(Serialize)]
pub struct MeOutput {
    pub id: UserId,
    pub email: Email,
}

impl From<User> for MeOutput {
    fn from(value: User) -> Self {
        Self {
            id: value.id,
            email: value.email,
        }
    }
}

#[derive(Clone, Debug, sqlx::FromRow)]
pub struct User {
    pub id: UserId,
    pub email: Email,
    pub hashed_password: HashedPassword,
}

#[derive(Debug, Clone, Serialize, sqlx::Type, sqlx::FromRow)]
#[sqlx(transparent)]
pub struct UserId(Uuid);

impl UserId {
    fn new() -> Self {
        Self(Uuid::now_v7())
    }
}

#[derive(Clone, Debug, Serialize, Distilled, sqlx::Type, sqlx::FromRow)]
#[sqlx(transparent)]
pub struct Email(String);

#[derive(Debug, Distilled)]
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

#[derive(Clone, Debug, sqlx::Type, sqlx::FromRow)]
#[sqlx(transparent)]
pub struct HashedPassword(String);

impl AsRef<str> for HashedPassword {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

#[derive(Clone, Serialize, sqlx::Type)]
#[sqlx(transparent)]
pub struct SessionToken(Uuid);

impl SessionToken {
    fn new() -> Self {
        Self(Uuid::now_v7())
    }
}

impl TryFrom<&str> for SessionToken {
    type Error = uuid::Error;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        Ok(Self(Uuid::try_parse(value)?))
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
