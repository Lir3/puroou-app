use actix_web::{delete, get, post, put, web, HttpMessage, HttpRequest, HttpResponse, Responder};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, IntoActiveModel, QueryFilter, QueryOrder, Set};
use serde::Deserialize;
use serde_json::json;

use crate::db::get_db;
use crate::models::{self};

#[derive(Debug, Deserialize)]
pub struct MemoForm {
    pub title: String,
    pub content: String,
}

// ルーティング定義
pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(list_memos)
        .service(create_memo)
        .service(update_memo)
        .service(delete_memo);
}

// メモ取得関数 id, 
async fn get_memo_by_id_and_user(
    db: &sea_orm::DatabaseConnection,
    memo_id: i64,
    user_id: &str,
) -> Result<models::Model, HttpResponse> {
    match models::Entity::find_by_id(memo_id)
        .filter(models::Column::UserId.eq(user_id))
        .one(db)
        .await
    {
        Ok(Some(memo)) => Ok(memo),
        Ok(None) => Err(HttpResponse::NotFound().json(json!({"error": "Memo not found"}))),
        Err(e) => Err(HttpResponse::InternalServerError().json(json!({"error": format!("Database error: {}", e)}))),
    }
}

// メモ取得
#[get("/api/memos")]
async fn list_memos(req: HttpRequest) -> impl Responder {

    let user_id = req.extensions().get::<String>().unwrap().clone();
    let db = get_db();

    match models::Entity::find()
        .filter(models::Column::UserId.eq(user_id))
        .order_by_desc(models::Column::CreatedAt)
        .all(db)
        .await
    {
        Ok(memos) => HttpResponse::Ok().json(memos),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "error": format!("Database error: {}", e)
        })),
    }
}

// メモ登録
#[post("/api/memos")]
async fn create_memo(req: HttpRequest, form: web::Json<MemoForm>) -> impl Responder {

    let user_id = req.extensions().get::<String>().unwrap().clone();
    let db = get_db();

    // メモ作成
    let new_memo = models::ActiveModel {
        user_id: Set(user_id.to_string()),
        title: Set(form.title.clone()),
        content: Set(form.content.clone()),
        created_at: Set(chrono::Utc::now()),
        ..Default::default()
    };

    // メモ登録
    match new_memo.insert(db).await {
        Ok(memo) => HttpResponse::Ok().json(memo),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "error": format!("Failed to create memo: {}", e)
        })),
    }
}

// メモ更新
#[put("/api/memos/{id}")]
async fn update_memo(
    req: HttpRequest,
    path: web::Path<i64>,
    form: web::Json<MemoForm>,
) -> impl Responder {

    let user_id = req.extensions().get::<String>().unwrap().clone();
    let memo_id = path.into_inner();
    let db = get_db();

    // メモ取得
    let memo = match get_memo_by_id_and_user(db, memo_id, &user_id).await {
        Ok(memo) => memo,
        Err(response) => return response,
    };

    // メモ更新
    let mut memo_active: models::ActiveModel = memo.into_active_model();
    memo_active.title = Set(form.title.clone());
    memo_active.content = Set(form.content.clone());
    match memo_active.update(db).await {
        Ok(updated_memo) => HttpResponse::Ok().json(updated_memo),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "error": format!("Failed to update memo: {}", e)
        })),
    }
}

// メモ削除
#[delete("/api/memos/{id}")]
async fn delete_memo(req: HttpRequest, path: web::Path<i64>) -> impl Responder {

    let user_id = req.extensions().get::<String>().unwrap().clone();
    let memo_id = path.into_inner();
    let db = get_db();

    // メモ取得
    let memo = match get_memo_by_id_and_user(db, memo_id, &user_id).await {
        Ok(memo) => memo,
        Err(response) => return response,
    };

    // メモ削除
    let memo_active: models::ActiveModel = memo.into_active_model();
    match memo_active.delete(db).await {
        Ok(_) => HttpResponse::Ok().json(json!({
            "message": "Memo deleted successfully"
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "error": format!("Failed to delete memo: {}", e)
        })),
    }
}
