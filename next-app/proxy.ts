import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SupabaseAuthService } from '@/lib/supabaseAuthService';

export const config = {
  // 除外パス設定
  matcher: ['/((?!api/auth/|_next/static/|favicon\\.ico$|memos$|$).*)'],
};

export async function proxy(req: NextRequest) {
  // ユーザーID取得
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const { json, status } = await SupabaseAuthService.getUserByAccessToken(
    token
  );
  if (status !== 200 || !json.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ユーザーIDをヘッダーに追加
  const response = NextResponse.next();
  response.headers.set('x-user-id', json.id as string);
  return response;
}
