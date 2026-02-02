'use client';

import { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

import { useRouter } from 'next/navigation';
import { apiFetch, errorHandling, getApiUrl } from '@/lib/apiFetch';

// マリオ風のテーマカラー
const MARIO_COLORS = {
  RED: '#E4002B', // マリオの服/帽子
  BLUE: '#0072C6', // 空/オーバーオール
  YELLOW: '#FFCC00', // コイン/スター
  BROWN: '#795548', // 土管/ブロック
  GREEN: '#4CAF50', // 土管
  SKY: '#90CAF9', // 背景の空
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(() => {
    // 初期エラーをURLフラグメントから取得
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const errorParam = params.get('error');
        const errorDescription = params.get('error_description');
        if (errorParam) {
          return errorDescription || errorParam;
        }
      }
    }
    return '';
  });

  useEffect(() => {
    (async () => {
      if (localStorage.getItem('user_session')) {
        router.push('/memos');
        return;
      }
      const sessionData = Object.fromEntries(
        new URLSearchParams(window.location.hash.substring(1))
      );
      const accessToken = sessionData?.access_token;
      if (!accessToken) return;
      const userData = await apiFetch('/api/auth/user', {}, accessToken);
      if (userData.email) sessionData.user = userData;
      localStorage.setItem('user_session', JSON.stringify(sessionData));
      router.push('/memos');
    })();
  }, [router]);

  const login = async () => {
    await errorHandling(async () => {
      const json = await apiFetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!json.access_token || !json.refresh_token) {
        throw new Error('トークンが取得できませんでした.');
      }
      localStorage.setItem('user_session', JSON.stringify(json));
      router.push('/memos');
    }, setError);
  };

  const register = async () => {
    await errorHandling(async () => {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setSuccessMessage(
        '登録リクエストを送信しました。Supabaseから確認メールが届いているか確認してください。'
      );
    }, setError);
  };

  const loginGithub = () => {
    window.location.href = getApiUrl("/auth/login/oauth2/github");
  };


  return (
    // 全体の背景をマリオの空っぽく
    <div
      className="w-full min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: MARIO_COLORS.SKY,
        paddingTop: '3rem', // 適切なマージン
        paddingBottom: '3rem',
      }}
    >
      <Card
        className="w-full max-w-md"
        // ブロックや土管風の見た目
        sx={{
          boxShadow: `8px 8px 0px ${MARIO_COLORS.BROWN}`, // レトロゲーム風の影
          border: `4px solid ${MARIO_COLORS.BROWN}`,
          borderRadius: '8px',
          backgroundColor: 'white', // パネル自体は明るく
          padding: '16px',
        }}
        variant="outlined"
      >
        <CardContent sx={{ padding: '8px !important' }}>
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              color: MARIO_COLORS.RED, // 赤色で強調
              textShadow: '1px 1px 0px black', // 少しレトロな影
              fontWeight: '900',
              textTransform: 'uppercase', // 大文字でゲーム風
              letterSpacing: '2px', // 文字間隔を広げて強調
            }}
            className="text-center font-bold"
          >
            🍄 P L A Y E R   L O G I N 🍄
          </Typography>

          <TextField
            label="E-MAIL (プレイヤー名)"
            fullWidth
            type="email"
            sx={{
              mb: 2,
              // 入力フィールドの枠線を少し強調
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: MARIO_COLORS.BLUE,
                  borderWidth: '2px',
                },
              },
              // ラベルのフォントもレトロ風に
              '& .MuiInputLabel-root': {
                fontWeight: 'bold',
                color: MARIO_COLORS.BROWN,
              }
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="PASSWORD (パスワード)"
            fullWidth
            type="password"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: MARIO_COLORS.BLUE,
                  borderWidth: '2px',
                },
              },
              '& .MuiInputLabel-root': {
                fontWeight: 'bold',
                color: MARIO_COLORS.BROWN,
              }
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* ログインボタン - マリオの赤 */}
          <Button
            variant="contained"
            className="w-full py-2"
            sx={{
              mb: 1.5,
              bgcolor: MARIO_COLORS.RED,
              color: MARIO_COLORS.YELLOW, // 黄色の文字でコイン風
              fontWeight: 'bold',
              fontSize: '1rem',
              textTransform: 'uppercase',
              boxShadow: `3px 3px 0px black`, // ボタンのレトロな影
              border: `2px solid black`,
              '&:hover': {
                bgcolor: MARIO_COLORS.RED,
                opacity: 0.9,
                boxShadow: `1px 1px 0px black` // ホバー時に影を小さく
              },
            }}
            onClick={login}
          >
            🍄 L O G I N 🍄
          </Button>

          {/* 新規登録ボタン - マリオの赤 */}
          <Button
            variant="contained"
            className="w-full py-2"
            sx={{
              mb: 1.5,
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
                boxShadow: `1px 1px 0px black`
              },
            }}
            onClick={register}
          >
            🌟 R E G I S T E R 🌟
          </Button>

          {/* GitHub ログインボタン - 通常の黒 */}
          <Button
            variant="contained"
            className="w-full py-2 flex items-center gap-2"
            sx={{
              bgcolor: 'black',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem',
              textTransform: 'uppercase',
              boxShadow: `3px 3px 0px ${MARIO_COLORS.BROWN}`,
              border: `2px solid ${MARIO_COLORS.BROWN}`,
              '&:hover': {
                bgcolor: 'black',
                opacity: 0.9,
                boxShadow: `1px 1px 0px ${MARIO_COLORS.BROWN}`
              },
            }}
            onClick={loginGithub}
          >
            <GitHubIcon />
            GITHUB 🚀
          </Button>
        </CardContent>
      </Card>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setError('')}
      >
        <Alert
          onClose={() => setError('')}
          severity="error"
          sx={{ fontWeight: 'bold' }} // アラートも強調
        >
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setSuccessMessage('')}
      >
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="success"
          sx={{ fontWeight: 'bold' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}