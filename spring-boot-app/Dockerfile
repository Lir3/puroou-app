# ビルドステージ Maven + Java イメージ
FROM maven:3.9.11-eclipse-temurin-21 AS build

# 作業ディレクトリ設定
WORKDIR /app
# pomコピー
COPY pom.xml ./
# 依存ライブラリインストール
RUN mvn dependency:go-offline
# モジュールコピー
COPY ./src ./src
# Mavenビルド（テストスキップ）
RUN mvn package -DskipTests

# 実行ステージ jreイメージ
FROM eclipse-temurin:21-jre-jammy

# 作業ディレクトリ設定
WORKDIR /app
# ビルドした jarコピー
COPY --from=build /app/target/*.jar ./app.jar
# SpringBootアプリ起動
CMD ["java", "-jar", "app.jar"]
# ポート指定
EXPOSE 8080