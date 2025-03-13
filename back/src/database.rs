use sqlx::postgres::{PgConnectOptions, PgPoolOptions};
use sqlx::PgPool;

use crate::configuration::DatabaseConfig;

impl From<DatabaseConfig> for PgConnectOptions {
    fn from(config: DatabaseConfig) -> Self {
        PgConnectOptions::new()
            .host(&config.host)
            .port(config.port)
            .username(&config.username)
            .password(&config.password)
            .database(&config.database)
    }
}

pub async fn get_connection_pool(config: DatabaseConfig) -> PgPool {
    let pool = PgPoolOptions::new()
        .connect_with(config.into())
        .await
        .expect("fail to connect to db");

    // TODO: doesnt work, manually have copied the migration 20240921151751_0.sql`
    // underway::MIGRATOR.run(&pool).await.unwrap();

    // TODO: handle errors
    //sqlx::migrate!().run(&pool).await.unwrap();

    pool
}
