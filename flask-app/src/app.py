from config import Config
from flask import Flask
from flask.wrappers import Response as ResponseBase
from flask_cors import CORS
from routes_auth import bp_auth
from supabase_auth_filter import auth_filter
from models import db
from routes_memo import bp_memo

# Flaskアプリケーション初期化
app = Flask(__name__, static_folder="static", static_url_path="")
app.register_blueprint(bp_auth)
app.before_request(auth_filter)

# DB設定(SQLAlchemy設定)
app.config["SQLALCHEMY_DATABASE_URI"] = Config.TIDB_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "connect_args": {"ssl": {"ssl": True}}
}
db.init_app(app)
app.register_blueprint(bp_memo)
CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:8080", "http://localhost:3000"]}},
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers="*",
    supports_credentials=True
)
# デフォルトページ
@app.route("/")
def serve_index() -> ResponseBase:
    return app.send_static_file("index.html")
    
# アプリケーションの実行
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.SERVER_PORT, debug=True)

