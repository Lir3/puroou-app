import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/lib/supabaseAuthService';

// ユーザ情報取得
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.slice(7) ?? '';
  const { json, status } = await SupabaseAuthService.getUserByAccessToken(token);
  return NextResponse.json({ email: json.email }, { status });
}
