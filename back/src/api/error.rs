use anyhow;
use async_graphql;
use thiserror;

#[derive(Debug, thiserror::Error)]
pub enum SignUpError {
    #[error("EmailAlreadyExists")]
    EmailAlreadyExists,

    #[error(transparent)]
    Internal(#[from] InternalError),
}

#[derive(Debug, thiserror::Error)]
pub enum SignInError {
    #[error("InvalidCredentials")]
    InvalidCredentials,

    #[error(transparent)]
    Internal(#[from] InternalError),
}

#[derive(Debug, thiserror::Error)]
pub enum TrackPurchaseError {
    #[error("Unauthorized")]
    Unauthorized,

    #[error(transparent)]
    Internal(#[from] InternalError),
}

#[derive(Debug, thiserror::Error)]
pub enum InternalError {
    #[error("DatabaseError")]
    DatabaseError(#[from] sqlx::Error),

    #[error("GraphQLError")]
    GraphQLError(async_graphql::Error),

    #[error("GenericError")]
    GenericError(#[from] anyhow::Error),
}

impl From<async_graphql::Error> for InternalError {
    fn from(error: async_graphql::Error) -> Self {
        InternalError::GraphQLError(error)
    }
}

pub trait ToInternalError<T> {
    fn to_internal(self) -> Result<T, InternalError>;
}

impl<T, E: Into<InternalError>> ToInternalError<T> for Result<T, E> {
    fn to_internal(self) -> Result<T, InternalError> {
        self.map_err(Into::into)
    }
}
