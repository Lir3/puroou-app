use actix_web::http::StatusCode;
use reqwest::{Client, Method};
use serde_json::{json, Value};
use once_cell::sync::Lazy;

use crate::config::CONFIG;

// グローバル reqwest クライアント
static CLIENT: Lazy<Client> = Lazy::new(|| Client::new());

// 共通 API リクエスト関数
async fn api_request(
    method: Method,
    path: &str,
    data: Option<Value>,
    access_token: Option<&str>,
) -> (Value, StatusCode) {

    let base = CONFIG.supabase_url.trim_end_matches('/');
    let path = path.trim_start_matches('/');
    let url = format!("{}/{}", base, path);

    let mut request = CLIENT
        .request(method, &url)
        .header("apikey", &CONFIG.supabase_anon_key)
        .header("Content-Type", "application/json");
    if let Some(token) = access_token {
        request = request.header("Authorization", format!("Bearer {}", token));
    }
    if let Some(body) = data {
        request = request.json(&body);
    }

    match request.send().await {
        Ok(response) => {
            let status = StatusCode::from_u16(response.status().as_u16()).unwrap();            
            let json = response.json().await.unwrap_or_else(|_| serde_json::json!({}));
            (json, status)
        }
        Err(err) => (json!({ "error": format!("Network error: {}", err) }), StatusCode::INTERNAL_SERVER_ERROR),
    }
}

// サインアップ
pub async fn signup(
    email: &str,
    password: &str,
    redirect_to: &str,
) -> (Value, StatusCode) {
    let data = json!({
        "email": email,
        "password": password,
        "options": { "email_redirect_to": redirect_to }
    });
    api_request(Method::POST, "/auth/v1/signup", Some(data), None).await
}

// ログイン（パスワード認証）
pub async fn login_with_password(
    email: &str,
    password: &str,
) -> (Value, StatusCode) {
    let data = json!({ "email": email, "password": password });
    api_request(
        Method::POST,
        "/auth/v1/token?grant_type=password",
        Some(data),
        None,
    )
    .await
}

// ユーザ情報取得
pub async fn get_user_by_access_token(access_token: &str) -> (Value, StatusCode) {
    api_request(Method::GET, "/auth/v1/user", None, Some(access_token)).await
}

// ログアウト
pub async fn logout(access_token: &str) -> (Value, StatusCode) {
    api_request(Method::POST, "/auth/v1/logout", None, Some(access_token)).await
}

// GitHub サインイン URL取得
pub fn get_github_signin_url(redirect_to: &str) -> String {
    format!(
        "{}/auth/v1/authorize?provider=github&redirect_to={}&scopes=user:email",
        CONFIG.supabase_url.trim_end_matches('/'),
        redirect_to
    )
}
