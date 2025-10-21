# Python イメージ
FROM python:3.12-slim

# 作業ディレクトリ作成
WORKDIR /app
# 依存ライブラリインストール
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
# モジュールコピー
COPY ./src ./src
# Gunicorn Flaskアプリ起動
ENV PYTHONPATH=/app/src
CMD ["gunicorn", "-b", "0.0.0.0:5000", "src.app:app"]

# ポート公開
EXPOSE 5000