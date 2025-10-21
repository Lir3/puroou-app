import os

class Config:
    # サーバ設定
    SERVER_PORT = 5000

    # Supabase 通信設定
    SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
    SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

    # TiDB Cloud (MySQL) 接続情報
    TIDB_USER = os.environ.get("TIDB_USER", "")
    TIDB_PASSWORD = os.environ.get("TIDB_PASSWORD", "")
    TIDB_HOST = os.environ.get("TIDB_HOST", "")
    TIDB_PORT = os.environ.get("TIDB_PORT", "")
    TIDB_DB_NAME = os.environ.get("TIDB_DB_NAME", "")
    TIDB_URI = f"mysql+pymysql://{TIDB_USER}:{TIDB_PASSWORD}@{TIDB_HOST}:{TIDB_PORT}/{TIDB_DB_NAME}"
