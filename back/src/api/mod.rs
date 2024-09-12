pub mod dummy_api;
pub mod error;
pub mod membership;

use async_graphql;
use uuid::Uuid;
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
#[derive(Debug, /* sqlx::Type, */ /* sqlx::FromRow, */ async_graphql::NewType)]
// #[sqlx(transparent)]
pub struct AccountToken(Uuid);

impl AccountToken {
    pub fn new() -> Self {
        Self(Uuid::now_v7())
    }
}
