const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// 共通APIリクエスト処理
async function apiRequest({
  method,
  path,
  data,
  accessToken,
}: {
  method: 'GET' | 'POST';
  path: string;
  data?: Record<string, unknown>;
  accessToken?: string;
}) {
  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  const url = `${SUPABASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(data) : undefined,
    });
    const json = await res.json().catch((e) => ({ error: `JSON parse error : ${String(e)}` }));
    return { json, status: res.status };
    
  } catch (e) {
    return { json: { error: `Network error : ${String(e)}` }, status: 500 };
  }
}

// サインアップ(メール/パスワード)
function signup(email: string, password: string, redirectTo: string) {
  return apiRequest({
    method: 'POST',
    path: '/auth/v1/signup',
    data: { email, password, options: { email_redirect_to: redirectTo } },
  });
}

// ログイン(メール/パスワード)
function login(email: string, password: string) {
  return apiRequest({
    method: 'POST',
    path: '/auth/v1/token?grant_type=password',
    data: { email, password },
  });
}

// ログアウト
function logout(accessToken: string) {
  return apiRequest({
    method: 'POST',
    path: '/auth/v1/logout',
    accessToken,
  });
}

// ユーザ情報取得
function getUserByAccessToken(accessToken: string) {
  return apiRequest({
    method: 'GET',
    path: '/auth/v1/user',
    accessToken,
  });
}

// GitHub認証用URL取得
function getGithubSigninUrl(redirectTo: string) {
  return `${SUPABASE_URL}/auth/v1/authorize?provider=github&redirect_to=${encodeURIComponent(
    redirectTo
  )}&scopes=user:email`;
}

export const SupabaseAuthService = {
  signup,
  login,
  logout,
  getUserByAccessToken,
  getGithubSigninUrl,
};

