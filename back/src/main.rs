use project::app::App;
use project::configuration::Config;

#[tokio::main]
async fn main() {
    let config = config::Config::builder()
        .add_source(config::File::with_name("config.yml"))
        .build()
        .unwrap()
        .try_deserialize::<Config>()
        .unwrap();

    App::run(config).await;
}
