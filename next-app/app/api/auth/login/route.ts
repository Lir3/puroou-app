import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/lib/supabaseAuthService';

// ログイン (メール／パスワード)
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const { json, status } = await SupabaseAuthService.login(email, password);
  return NextResponse.json(json, { status });
}