use crate::api::error::{SignInError, SignUpError, ToInternalError};
// use crate::api::{AccountId, AccountToken};
use anyhow::Result;
use async_graphql::{
    self, Context, InputValueError, InputValueResult, Object, Scalar, ScalarType, Value,
};
// use bcrypt::{hash, verify};
use secrecy::{ExposeSecret, SecretString};
// use sqlx::PgPool;
// use std::sync::Arc;
use uuid::Uuid;

pub struct MembershipMutation;

#[Object]
impl MembershipMutation {
    pub async fn sign_up(
        &self,
        ctx: &Context<'_>,
        email: Email,
        password: PlainTextPassword,
    ) -> Result<SessionToken, SignUpError> {
        // let pool = ctx.data::<Arc<PgPool>>().to_internal()?;
        //
        // let user = User {
        //     id: UserId::new(),
        //     email,
        //     hashed_password: password.hash(),
        // };
        //
        // let mut tx = pool.begin().await.to_internal()?;
        //
        // let result = async {
        //     if let CreateUserResult::EmailAlreadyExists =
        //         create_user(&mut tx, &user).await.to_internal()?
        //     {
        //         return Err(SignUpError::EmailAlreadyExists);
        //     }
        //
        //     let session_token = create_session(&mut tx, &user).await.to_internal()?;
        //     Ok(session_token)
        // }
        // .await;
        //
        // match &result {
        //     Ok(_) => tx.commit().await.to_internal()?,
        //     Err(_) => tx.rollback().await.to_internal()?,
        // }
        //
        // result
        Ok(SessionToken::new())
    }

    pub async fn sign_in(
        &self,
        ctx: &Context<'_>,
        email: Email,
        password: PlainTextPassword,
    ) -> Result<SessionToken, SignInError> {
        // let pool = ctx.data::<Arc<PgPool>>().to_internal()?;
        //
        // let mut tx = pool.begin().await.to_internal()?;
        //
        // let result = async {
        //     let user = get_user_by_email(&mut tx, &email)
        //         .await
        //         .to_internal()?
        //         .ok_or(SignInError::InvalidCredentials)?;
        //
        //     if !verify_password(&password, &user.hashed_password) {
        //         return Err(SignInError::InvalidCredentials);
        //     }
        //
        //     let session_token = create_session(&mut tx, &user).await.to_internal()?;
        //     Ok(session_token)
        // }
        // .await;
        //
        // match &result {
        //     Ok(_) => tx.commit().await.to_internal()?,
        //     Err(_) => tx.rollback().await.to_internal()?,
        // }
        //
        // result
        Ok(SessionToken::new())
    }
}

// async fn create_user(
//     transaction: &mut sqlx::Transaction<'_, sqlx::Postgres>,
//     user: &User,
// ) -> Result<CreateUserResult> {
//     let exists = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM \"user\" WHERE email = $1)")
//         .bind(&user.email)
//         .fetch_one(&mut **transaction)
//         .await?;
//
//     if exists {
//         return Ok(CreateUserResult::EmailAlreadyExists);
//     }
//
//     sqlx::query("INSERT INTO \"user\" (id, email, hashed_password) VALUES ($1, $2, $3)")
//         .bind(&user.id)
//         .bind(&user.email)
//         .bind(&user.hashed_password)
//         .execute(&mut **transaction)
//         .await?;
//
//     let account_id = AccountId::new();
//     let account_token = AccountToken::new();
//
//     sqlx::query("INSERT INTO account (id, user_id, token) VALUES ($1, $2, $3)")
//         .bind(account_id)
//         .bind(&user.id)
//         .bind(account_token)
//         .execute(&mut **transaction)
//         .await?;
//
//     Ok(CreateUserResult::UserCreated)
// }

// async fn get_user_by_email(
//     transaction: &mut sqlx::Transaction<'_, sqlx::Postgres>,
//     email: &Email,
// ) -> Result<Option<User>> {
//     let user = sqlx::query_as::<_, User>(
//         "SELECT id, email, hashed_password FROM \"user\" WHERE email = $1::citext",
//     )
//     .bind(email)
//     .fetch_optional(&mut **transaction)
//     .await?;
//
//     Ok(user)
// }

// async fn create_session(
//     transaction: &mut sqlx::Transaction<'_, sqlx::Postgres>,
//     user: &User,
// ) -> Result<SessionToken> {
//     let token = SessionToken::new();
//
//     sqlx::query("INSERT INTO \"session\" (token, user_id) VALUES ($1, $2)")
//         .bind(&token)
//         .bind(&user.id)
//         .execute(&mut **transaction)
//         .await?;
//
//     Ok(token)
// }

// pub enum CreateUserResult {
//     UserCreated,
//     EmailAlreadyExists,
// }
//
// #[derive(Debug, sqlx::FromRow)]
// struct User {
//     pub id: UserId,
//     pub email: Email,
//     pub hashed_password: HashedPassword,
// }
//
// #[derive(Debug, sqlx::Type, sqlx::FromRow)]
// #[sqlx(transparent)]
// struct UserId(Uuid);
//
// impl UserId {
//     fn new() -> Self {
//         Self(Uuid::now_v7())
//     }
// }
//
// #[derive(Debug, sqlx::Type, sqlx::FromRow)]
// #[sqlx(transparent)]
pub struct Email(String);

pub struct PlainTextPassword(SecretString);
//
// impl PlainTextPassword {
//     fn hash(&self) -> HashedPassword {
//         HashedPassword(hash(self.0.expose_secret(), 4).unwrap())
//     }
// }
//
// #[derive(Debug, sqlx::Type, sqlx::FromRow)]
// #[sqlx(transparent)]
struct HashedPassword(String);
//
// enum instead of bool
// fn verify_password(plain: &PlainTextPassword, hashed: &HashedPassword) -> bool {
//     verify(&plain.0.expose_secret(), &hashed.0).unwrap()
// }

#[derive(Debug, /* sqlx::Type, sqlx::FromRow, */ async_graphql::NewType)]
// #[sqlx(transparent)]
pub struct SessionToken(Uuid);

impl SessionToken {
    fn new() -> Self {
        Self(Uuid::now_v7())
    }
}

#[Scalar]
impl ScalarType for Email {
    fn parse(value: Value) -> InputValueResult<Self> {
        if let Value::String(s) = value {
            let trimmed = s.trim();
            if trimmed.is_empty() {
                return Err(InputValueError::custom("Email cannot be empty"));
            }
            if trimmed.len() > 320 {
                return Err(InputValueError::custom("Email is too long"));
            }
            if !trimmed.contains('@') {
                return Err(InputValueError::custom("Email must contain @"));
            }
            Ok(Email(trimmed.to_owned()))
        } else {
            Err(InputValueError::custom("Invalid email format"))
        }
    }

    fn to_value(&self) -> Value {
        Value::String(self.0.clone())
    }
}

#[Scalar]
impl ScalarType for PlainTextPassword {
    fn parse(value: Value) -> InputValueResult<Self> {
        if let Value::String(s) = value {
            if s.is_empty() {
                return Err(InputValueError::custom("Password cannot be empty"));
            }
            if s.len() > 320 {
                return Err(InputValueError::custom("Password is too long"));
            }
            Ok(PlainTextPassword(SecretString::new(s)))
        } else {
            Err(InputValueError::custom("Invalid password format"))
        }
    }

    fn to_value(&self) -> Value {
        Value::String("********".to_string()) // Mask the password when returned
    }
}
