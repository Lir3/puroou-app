from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# DB初期化
db = SQLAlchemy()

# メモモデル
class Memo(db.Model):
    __tablename__ = "memos"
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(255), nullable=False, index=True)
    title = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)