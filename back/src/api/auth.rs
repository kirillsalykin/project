use crate::api::membership::{SessionToken, User};

use anyhow::Result;
use axum::{
    extract::{Request, State},
    http::{StatusCode, header},
    middleware::Next,
    response::Response,
};
use sqlx::PgPool;

pub async fn authorization(
    State(db): State<PgPool>,
    mut req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let token = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok())
        .and_then(|header| header.strip_prefix("Bearer "));

    if let Some(token) = token {
        if let Ok(token) = token.try_into() {
            if let Ok(Some(user)) = get_user_by_token(db, &token).await {
                req.extensions_mut().insert(user);
                return Ok(next.run(req).await);
            }
        }
    }

    Err(StatusCode::UNAUTHORIZED)
}

async fn get_user_by_token(db: PgPool, token: &SessionToken) -> Result<Option<User>> {
    let user = sqlx::query_as::<_, User>(
        "SELECT id, email FROM \"user\" JOIN session on session.user_id = \"user\".id WHERE token = $1",
    )
    .bind(token)
    .fetch_optional(&db)
    .await?;

    Ok(user)
}
