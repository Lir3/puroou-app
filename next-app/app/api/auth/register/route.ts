import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/lib/supabaseAuthService';
import { RequestUrlHelper } from '@/lib/requestUrlHelper';

// 新規登録 (サインアップ)
export async function POST(req: NextRequest) {
  // リクエストボディから値を取得
  const { email, password } = await req.json();
  // リダイレクトURLを生成
  const redirectTo = RequestUrlHelper.getBaseUrl(req);
  // 登録処理を実行
  const { json } = await SupabaseAuthService.signup(
    email,
    password,
    redirectTo
  );
  // 結果を返す
  return json?.id
    ? NextResponse.json({
        message:
          'Registration successful. Please check your email for confirmation.',
      })
    : NextResponse.json(json, { status: 400 });
}
