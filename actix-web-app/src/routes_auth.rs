use actix_web::{
    get, post,
    web::{self, Json},
    HttpRequest, HttpResponse, Responder,
};
use serde::Deserialize;
use log::info;
use crate::supabase_auth_service;

#[derive(Deserialize)]
pub struct AuthForm {
    pub email: String,
    pub password: String,
}

// ルーティング定義 
pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(register)
        .service(login)
        .service(get_user)
        .service(logout_user)
        // ↓この行を追加 
        .service(github_redirect);
}


// ベースホストURL取得
fn base_host_url(req: &HttpRequest) -> String {
    let host = req
        .headers()
        .get("X-Forwarded-Host")
        .and_then(|v| v.to_str().ok())
        .map(|v| v.to_string())
        .unwrap_or_else(|| {
            req.connection_info().host().to_string()
        });
    let scheme = req
        .headers()
        .get("X-Forwarded-Proto")
        .and_then(|v| v.to_str().ok())
        .map(|v| v.to_string())
        .unwrap_or_else(|| {
            req.connection_info().scheme().to_string()
        });
    info!("base_host_url host={} scheme={}", host, scheme);
    format!("{}://{}/", scheme, host)
}

// アカウント登録
#[post("/api/auth/register")]
async fn register(req: HttpRequest, form: Json<AuthForm>) -> impl Responder {
    let redirect_to = base_host_url(&req);
    // let redirect_to = format!("{}/", host.trim_end_matches('/'));

    let (result, _) = supabase_auth_service::signup(&form.email, &form.password, &redirect_to).await;

    if result.get("id").is_some() {
        HttpResponse::Ok().json(serde_json::json!({
            "message": "Registration successful. Please check your email for confirmation."
        }))
    } else {
        HttpResponse::BadRequest().json(result)
    }
}

// ログイン
#[post("/api/auth/login")]
async fn login(form: Json<AuthForm>) -> impl Responder {
    let (result, status) = supabase_auth_service::login_with_password(&form.email, &form.password).await;
    HttpResponse::build(status.into()).json(result)
}

// ユーザ情報取得
#[get("/api/auth/user")]
async fn get_user(req: HttpRequest) -> impl Responder {
    let token = req
        .headers()
        .get("authorization")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("")
        .strip_prefix("Bearer ")
        .unwrap_or("");

    let (result, status) = supabase_auth_service::get_user_by_access_token(token).await;
    let email = result.get("email").cloned().unwrap_or_default();
    HttpResponse::build(status.into()).json(serde_json::json!({ "email": email }))
}

// ログアウト
#[post("/api/auth/logout")]
async fn logout_user(req: HttpRequest) -> impl Responder {
    let token = req
        .headers()
        .get("authorization")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("")
        .strip_prefix("Bearer ")
        .unwrap_or("");

    let (_, _) = supabase_auth_service::logout(token).await;
    HttpResponse::Ok().json(serde_json::json!({ "message": "Logout successful." }))
}

// GitHub認証リダイレクト
#[get("/api/auth/oauth2/github")]
async fn github_redirect(req: HttpRequest) -> impl Responder {
    let redirect_to = base_host_url(&req);
    let github_url = supabase_auth_service::get_github_signin_url(&redirect_to);
    HttpResponse::Found()
        .append_header(("Location", github_url))
        .finish()
}
