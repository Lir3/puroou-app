import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/lib/supabaseAuthService';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.slice(7) ?? '';

  // 【修正点】any を避けるため、Record<string, unknown> を使用して型アサーションを行う
  const result = await SupabaseAuthService.logout(token) as {
    json: Record<string, unknown> | null;
    status: number;
  };
  
  let { json, status } = result;

  // 1. ステータスが 204 (No Content) などの成功系の場合、200 OK に正規化する
  if (status === 204 || status === 401 || status === 403) {
    status = 200;
    json = { message: 'Logged out successfully' };
  }
  
  // 2. "JSON parse error" のチェック
  // json が null でなく、かつ error プロパティが存在するか安全に確認
  if (json && 'error' in json && typeof json.error === 'string') {
     if (json.error.includes('JSON parse error')) {
         // ステータスがサーバーエラー(500)以外なら成功とみなす
         if (status < 500) {
            status = 200;
            json = { message: 'Logged out successfully (Empty response handled)' };
         }
     }
  }

  // レスポンスボディの安全策
  const body = json && Object.keys(json).length > 0 ? json : { message: 'Logged out successfully' };

  const res = NextResponse.json(body, { status });

  return res;
}