# ビルドステージ 開発用イメージ
FROM rust:1.91-slim AS builder

# 作業ディレクトリ作成
WORKDIR /app

# 必要なパッケージをインストール
RUN apt-get update && \
    apt-get install -y pkg-config libssl-dev build-essential && \
    apt-get clean

# パッケージ管理、ソースコードをコピー
COPY Cargo.toml Cargo.lock ./
COPY ./src ./src
COPY ./static ./static

# ビルド
RUN cargo build --release

# 実行ステージ 実行用イメージ
FROM debian:bookworm-slim

# 作業ディレクトリ作成
WORKDIR /app

# OpenSSL ランタイム + CA 証明書
RUN apt-get update && \
    apt-get install -y libssl3 ca-certificates && \
    apt-get clean
    
# 必要なファイルのみコピー
COPY --from=builder /app/target/release/actix-web-app /app/actix-web-app
COPY --from=builder /app/static ./static

# Actix-webアプリ起動
CMD ["/app/actix-web-app"]