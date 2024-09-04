use serde::Deserialize;
use std::net::SocketAddr;

#[derive(Debug, Deserialize)]
pub struct Config {
    pub app: AppConfig,
    // pub database: DatabaseConfig,
}

#[derive(Debug, Deserialize)]
pub struct AppConfig {
    pub addr: SocketAddr,
}

// #[derive(Debug, Deserialize)]
// pub struct DatabaseConfig {
//     pub host: String,
//     pub port: u16,
//     pub username: String,
//     pub password: String,
//     pub database: String,
// }
