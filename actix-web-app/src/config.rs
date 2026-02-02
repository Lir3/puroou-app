use std::env;
use once_cell::sync::Lazy;

#[derive(Debug)]
pub struct Config {
    // サーバ設定
    pub server_port: u16,

    // Supabase 通信設定
    pub supabase_url: String,
    pub supabase_anon_key: String,

    // TiDB Cloud (MySQL) 接続情報
    // pub tidb_user: String,
    // pub tidb_password: String,
    // pub tidb_host: String,
    // pub tidb_port: String,
    // pub tidb_db_name: String,
    pub tidb_uri: String,
}

impl Config {
    pub fn from_env() -> Self {
        let server_port = 8280;

        let supabase_url = env::var("SUPABASE_URL").unwrap_or_default();
        let supabase_anon_key = env::var("SUPABASE_ANON_KEY").unwrap_or_default();

        let tidb_user = env::var("TIDB_USER").unwrap_or_default();
        let tidb_password = env::var("TIDB_PASSWORD").unwrap_or_default();
        let tidb_host = env::var("TIDB_HOST").unwrap_or_default();
        let tidb_port = env::var("TIDB_PORT").unwrap_or_default();
        let tidb_db_name = env::var("TIDB_DB_NAME").unwrap_or_default();

        let tidb_uri = format!(
            "mysql://{}:{}@{}:{}/{}",
            tidb_user, tidb_password, tidb_host, tidb_port, tidb_db_name
        );

        Config {
            server_port,
            supabase_url,
            supabase_anon_key,
            // tidb_user,
            // tidb_password,
            // tidb_host,
            // tidb_port,
            // tidb_db_name,
            tidb_uri,
        }
    }
}

// グローバルなシングルトンとして公開
pub static CONFIG: Lazy<Config> = Lazy::new(Config::from_env);
