use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    http::header,
    Error, HttpMessage,
};
use futures_util::future::{ok, LocalBoxFuture, Ready};
use std::task::{Context, Poll};
use regex::Regex;

use crate::supabase_auth_service;

// ミドルウェアファクトリ
pub struct SupabaseAuthMiddleware;

impl<S, B> Transform<S, ServiceRequest> for SupabaseAuthMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = SupabaseAuthMiddlewareService<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(SupabaseAuthMiddlewareService { 
            service: std::rc::Rc::new(service) 
        })
    }
}

// ミドルウェアサービス（実際の処理を行う）
pub struct SupabaseAuthMiddlewareService<S> {
    service: std::rc::Rc<S>,
}

// 認証不要パターン
fn is_auth_ignored(path: &str) -> bool {
    let patterns = vec![
        r"^/$",
        r"^/favicon\.ico$",
        r"^/api/auth/",
        r"\.html$",
        r"\.css$",
        r"\.js$",
    ];
    patterns.iter().any(|p| Regex::new(p).unwrap().is_match(path))
}

impl<S, B> Service<ServiceRequest> for SupabaseAuthMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        // 認証不要パス判定
        if is_auth_ignored(req.path()) {
            return Box::pin(self.service.call(req));
        }

        // 認証ヘッダーよりトークン取得
        let auth_header = req.headers().get(header::AUTHORIZATION).and_then(|h| h.to_str().ok()).unwrap_or("");
        if !auth_header.starts_with("Bearer ") {
            println!("認証ヘッダーがありません、または不正な形式です: {}", auth_header);
            return Box::pin(async { Err(actix_web::error::ErrorUnauthorized("Unauthorized")) });
        }
        let token = auth_header[7..].to_string();

        let service = self.service.clone();        
        Box::pin(async move {

            // トークンよりユーザ情報取得
            let (user_result, status) = supabase_auth_service::get_user_by_access_token(&token).await;
            if user_result.get("id").is_none() {
                println!("Status: {}, Message: {:?}", status, user_result.get("error"));
                return Err(actix_web::error::ErrorUnauthorized("Unauthorized"));
            }
            
            // ユーザーIDをリクエストコンテキスト保存
            req.extensions_mut().insert(user_result["id"].as_str().unwrap().to_string());

            // 後続の処理を実行
            service.call(req).await
        })
    }
}