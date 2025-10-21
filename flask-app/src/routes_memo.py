from flask import Blueprint, jsonify, request, g
from models import db, Memo
from datetime import datetime

# メモ操作ルーティング
bp_memo = Blueprint("memo", __name__)

# DB例外処理デコレータ
def handle_db_exceptions(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Database error: {str(e)}"}), 500
    wrapper.__name__ = func.__name__
    return wrapper

# メモ取得
@bp_memo.route("/api/memos", methods=["GET"])
@handle_db_exceptions
def get_memos():
    memos = Memo.query.filter_by(user_id=g.user_id).order_by(Memo.created_at.desc()).all()
    result = [
        {c.name: getattr(memo, c.name) for c in Memo.__table__.columns}
        for memo in memos
    ]
    return jsonify(result), 200

# メモ登録
@bp_memo.route("/api/memos", methods=["POST"])
@handle_db_exceptions
def create_memo():
    data = request.get_json() or {}
    memo = Memo(
        user_id=g.user_id,
        title=data.get("title", ""),
        content=data.get("content", ""),
        created_at=datetime.now()
    )
    db.session.add(memo)
    db.session.commit()
    result = {c.name: getattr(memo, c.name) for c in Memo.__table__.columns}
    return jsonify(result), 200

# メモ更新
@bp_memo.route("/api/memos/<int:id>", methods=["PUT"])
@handle_db_exceptions
def update_memo(id):
    data = request.get_json() or {}
    memo = Memo.query.filter_by(id=id, user_id=g.user_id).first()
    if not memo:
        return jsonify({"error": "Memo not found"}), 404
    memo.title = data.get("title", memo.title)
    memo.content = data.get("content", memo.content)
    db.session.commit()
    result = {c.name: getattr(memo, c.name) for c in Memo.__table__.columns}
    return jsonify(result), 200

# メモ削除
@bp_memo.route("/api/memos/<int:id>", methods=["DELETE"])
@handle_db_exceptions
def delete_memo(id):
    memo = Memo.query.filter_by(id=id, user_id=g.user_id).first()
    if not memo:
        return jsonify({"error": "Memo not found"}), 404
    db.session.delete(memo)
    db.session.commit()
    return jsonify({"id": id}), 200
