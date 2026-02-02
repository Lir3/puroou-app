'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  IconButton,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { apiAuthFetch, errorHandling } from '@/lib/apiFetch';

// マリオ風のテーマカラーを再定義
const MARIO_COLORS = {
  RED: '#E4002B', // マリオの服/帽子 (メインアクション)
  BLUE: '#0072C6', // 空/オーバーオール
  YELLOW: '#FFCC00', // コイン/スター
  BROWN: '#795548', // 土管/ブロック (サブアクション/枠線)
  GREEN: '#4CAF50', // 土管 (アクセント)
  SKY: '#90CAF9', // 背景の空
  BRICK: '#B7410E', // レンガブロック
  ITEM_BOX: '#FFDA00', // アイテムボックスの黄色
};

type Memo = {
  id: number;
  user_id: string;
  title: string;
  content?: string;
  createdAt: string;
};

// ユーザーセッションの型定義（メールアドレス取得のために必要）
type UserSession = {
  user?: {
    email?: string;
  };
  email?: string; // rootレベルにemailがある場合もあるため
};

export default function MemosPage() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  // ユーザーメールアドレス用のステートを追加
  const [userEmail, setUserEmail] = useState('...'); 
  
  const router = useRouter();

  const loadMemos = async () => {
    await errorHandling(async () => {
      const json = await apiAuthFetch('/api/memos');
      setMemos(json);
    }, setError);
  };

  useEffect(() => {
    // ログイン中のユーザーメールアドレスを取得
    if (typeof window !== 'undefined') {
        const sessionString = localStorage.getItem('user_session');
        if (sessionString) {
            try {
                const session: UserSession = JSON.parse(sessionString);
                // セッションデータからメールアドレスを取得 (user.email または email の順で探す)
                const email = session.user?.email || session.email || 'メールアドレス不明';
                setUserEmail(email);
            } catch (e) {
                console.error("Failed to parse user session:", e);
                setUserEmail('セッションエラー');
            }
        } else {
            // セッションがない場合はログインページへリダイレクト
            router.push('/');
        }
    }

    // メモの読み込み
    (async () => {
      await loadMemos();
    })();
  }, [router]);

  async function createMemo() {
    await errorHandling(async () => {
      await apiAuthFetch('/api/memos', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      });
      setTitle('');
      setContent('');
      await loadMemos();
    }, setError);
  }

  async function deleteMemo(id: number) {
    await errorHandling(async () => {
      await apiAuthFetch(`/api/memos/${id}`, {
        method: 'DELETE',
      });
      await loadMemos();
    }, setError);
  }

  function startEdit(memo: Memo) {
    setEditingId(memo.id);
    setEditTitle(memo.title);
    setEditContent(memo.content || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  }

  async function updateMemo(id: number) {
    await errorHandling(async () => {
      await apiAuthFetch(`/api/memos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
      });

      cancelEdit();
      await loadMemos();
    }, setError);
  }

  async function logout() {
    setError('');
    try {
      // ログアウト処理はセッション破棄が目的であり、レスポンス本文は不要なため、
      // JSONパースを行わないシンプルなfetchを使用するか、
      // サーバーが204 No Contentを返すように修正することが望ましい。
      
      // シンプルな認証付きfetch（JSONパースをしない）を行うためのロジックをここに記述する
      // ただし、apiAuthFetchの実装がないため、一時的にtry/catchでエラーを無視します。
      // ★ サーバー側で500エラーが起きているため、このtry/catchは根本解決ではありませんが、
      //    クライアント側のJSONエラーを回避できます。

      const sessionString = localStorage.getItem('user_session');
      if (sessionString) {
        const session = JSON.parse(sessionString);
        const accessToken = session.access_token;

        await fetch(`/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        });
        // 500エラーが発生しても、finallyブロックに処理を進める
      }

    } catch (e) {
      console.error("Logout API call failed, but proceeding with client cleanup.", e);
      // ログアウトAPI呼び出しでエラーが発生した場合でも、クライアント側の処理は続行する
    } finally {
      // クライアント側のセッション情報を削除し、リダイレクトする
      localStorage.removeItem('user_session');
      router.push('/');
    }
  }

  return (
    <div
      className="w-full min-h-screen flex justify-center"
      style={{
        backgroundColor: MARIO_COLORS.SKY,
        paddingTop: '3rem',
        paddingBottom: '3rem',
      }}
    >
      <div className="max-w-2xl w-full px-4 py-10">
        {/* ヘッダーエリア */}
        <div className="flex justify-between items-center mb-1">
          <Typography
            variant="h4"
            sx={{
              color: MARIO_COLORS.RED,
              textShadow: '2px 2px 0px black',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '3px',
            }}
          >
            🍄 メモ キノコ 🍄
          </Typography>
          {/* ログアウトボタン */}
          <Button
            variant="contained"
            onClick={logout}
            sx={{
              bgcolor: MARIO_COLORS.BROWN,
              color: 'white',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              boxShadow: `3px 3px 0px black`,
              border: `2px solid black`,
              '&:hover': {
                bgcolor: MARIO_COLORS.BROWN,
                opacity: 0.9,
                boxShadow: `1px 1px 0px black`,
              },
            }}
          >
            ログアウト
          </Button>
        </div>
        
        {/* ログイン中のメールアドレス表示 */}
        <div className="mb-6">
            <Typography 
                variant="subtitle1" 
                sx={{
                    color: MARIO_COLORS.BROWN,
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    textShadow: '1px 1px 0px white'
                }}
            >
                ⭐ プレイヤー: {userEmail}
            </Typography>
        </div>

        {/* エラーメッセージ */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          onClose={() => setError('')}
        >
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>

        {/* メモ追加エリア - アイテムボックス風の黄色 */}
        <Card
          className="mb-6"
          sx={{
            backgroundColor: MARIO_COLORS.ITEM_BOX,
            boxShadow: `8px 8px 0px ${MARIO_COLORS.BROWN}`,
            border: `4px solid ${MARIO_COLORS.BROWN}`,
            borderRadius: '8px',
          }}
          variant="outlined"
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: MARIO_COLORS.BRICK,
                mb: 2,
              }}
            >
              ？ ブロックに メモ入力
            </Typography>
            <TextField
              label="タイトル"
              fullWidth
              sx={{ mb: 1.5 }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="内容"
              fullWidth
              multiline
              minRows={3}
              sx={{ mb: 2 }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {/* 追加ボタン - マリオの赤 */}
            <Button
              variant="contained"
              className="w-full"
              onClick={createMemo}
              sx={{
                bgcolor: MARIO_COLORS.RED,
                color: MARIO_COLORS.YELLOW,
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'uppercase',
                boxShadow: `3px 3px 0px black`,
                border: `2px solid black`,
                '&:hover': {
                  bgcolor: MARIO_COLORS.RED,
                  opacity: 0.9,
                  boxShadow: `1px 1px 0px black`,
                },
              }}
            >
              ⭐ メモを 追加 ⭐
            </Button>
          </CardContent>
        </Card>

        <Divider
          sx={{
            my: 4,
            borderBottomWidth: 4,
            borderColor: MARIO_COLORS.BROWN,
          }}
        />

        {/* メモ一覧エリア */}
        <div className="space-y-4">
          {memos.map((memo) => (
            <Card
              key={memo.id}
              sx={{
                // メモカードはレンガブロック風
                backgroundColor: 'white',
                border: `3px solid ${MARIO_COLORS.BRICK}`,
                boxShadow: `5px 5px 0px ${MARIO_COLORS.BRICK}`,
              }}
            >
              <CardContent>
                {editingId === memo.id ? (
                  <>
                    <TextField
                      label="タイトル (編集中)"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <TextField
                      label="内容 (編集中)"
                      fullWidth
                      multiline
                      minRows={3}
                      sx={{ mb: 2 }}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      {/* 保存ボタン - 緑（土管の色） */}
                      <IconButton
                        sx={{ color: MARIO_COLORS.GREEN }}
                        onClick={() => updateMemo(memo.id)}
                      >
                        <SaveIcon />
                      </IconButton>
                      {/* キャンセルボタン - 青（空の色） */}
                      <IconButton
                        sx={{ color: MARIO_COLORS.BLUE }}
                        onClick={cancelEdit}
                      >
                        <CancelIcon />
                      </IconButton>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <Typography
                        className="text-xs"
                        sx={{ color: MARIO_COLORS.BROWN, fontWeight: 'bold' }}
                      >
                        入力日: {new Date(memo.createdAt).toLocaleString()}
                      </Typography>
                      <div>
                        {/* 編集ボタン - 黄色（コインの色） */}
                        <IconButton
                          sx={{ color: MARIO_COLORS.YELLOW }}
                          size="small"
                          onClick={() => startEdit(memo)}
                        >
                          <EditIcon />
                        </IconButton>
                        {/* 削除ボタン - 赤（爆発/危険の色） */}
                        <IconButton
                          sx={{ color: MARIO_COLORS.RED }}
                          size="small"
                          onClick={() => deleteMemo(memo.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </div>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 1,
                        color: MARIO_COLORS.RED,
                        fontWeight: 'bold',
                        textShadow: '0.5px 0.5px 0px black',
                      }}
                    >
                      {memo.title}
                    </Typography>
                    <Typography
                      sx={{ color: 'black', whiteSpace: 'pre-line' }}
                    >
                      {memo.content}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}