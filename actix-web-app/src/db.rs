use sea_orm::{Database, DatabaseConnection, DbErr};
use once_cell::sync::OnceCell;

use crate::config::CONFIG;

// グローバルDB接続（シングルトン）
static DB: OnceCell<DatabaseConnection> = OnceCell::new();

/// DB初期化（TiDB接続）
pub async fn init_db() -> Result<(), DbErr> {
    let db = Database::connect(&CONFIG.tidb_uri).await?;
    DB.set(db).map_err(|_| DbErr::Custom("DB already initialized".to_string()))?;    
    println!("✅ Database connected successfully");
    Ok(())
}

/// DB接続取得
pub fn get_db() -> &'static DatabaseConnection {
    DB.get().expect("Database not initialized. Call init_db() first.")
}
