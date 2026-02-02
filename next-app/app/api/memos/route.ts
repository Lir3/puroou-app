import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { queryErrorHandler } from '@/lib/queryErrorHandler';

// メモ一覧取得
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id') ?? '';
  return queryErrorHandler.errorHandling(async () => {
    const memos = await prisma.memo.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(memos);
  });
}

// メモ一登録
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id') ?? '';
  const body = await req.json();
  return queryErrorHandler.errorHandling(async () => {
    const memo = await prisma.memo.create({
      data: {
        userId: userId,
        title: body.title ?? '',
        content: body.content ?? '',
      },
    });
    return NextResponse.json(memo);
  });
}
