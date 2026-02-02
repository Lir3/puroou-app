import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/lib/supabaseAuthService';
import { RequestUrlHelper } from '@/lib/requestUrlHelper';

// GitHub認証URLリダイレクト
export function GET(req: NextRequest) {
  const redirectTo = RequestUrlHelper.getBaseUrl(req);
  const url = SupabaseAuthService.getGithubSigninUrl(redirectTo);
  return NextResponse.redirect(url);
}