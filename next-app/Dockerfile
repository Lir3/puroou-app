# ビルドステージ
FROM node:24-bullseye AS builder

# 作業ディレクトリ作成
WORKDIR /app

# アプリライブラリインストール(ビルド時)
COPY package*.json ./
RUN npm ci

# ソースコードをコピー
COPY ./app ./app
COPY ./lib ./lib
COPY ./prisma/schema.prisma ./prisma/
COPY ./public ./public
COPY *.ts *.config.mjs tsconfig.json ./

# 環境変数設定
ENV NODE_ENV=production

# Prisma Clientの生成
RUN npx prisma generate

# ビルド
RUN npm run build

# 実行ステージ
FROM node:24-bullseye-slim

# 作業ディレクトリ作成
WORKDIR /app

# OpenSSL ランタイム + CA 証明書 インストール
RUN apt-get update && \
    apt-get install -y ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# アプリライブラリインストール(実行時)
COPY package*.json ./
RUN npm ci --omit=dev

# 必要なファイルのみコピー
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma/prisma-client ./prisma/prisma-client

# Next.jsアプリ起動
CMD ["npm", "start"]