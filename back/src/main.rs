use project::configuration::Config;
use project::App;

#[tokio::main]
async fn main() {
    let config = config::Config::builder()
        .add_source(config::File::with_name("config.yml"))
        .build()
        .unwrap()
        .try_deserialize::<Config>()
        .unwrap();

    let app = App::build(config).await;
    app.run_forever().await;
}

