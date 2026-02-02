import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { queryErrorHandler } from '@/lib/queryErrorHandler';

// メモ更新
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = req.headers.get('x-user-id') ?? '';
  const id = Number((await params).id);
  const body = await req.json();
  return queryErrorHandler.errorHandling(async () => {
    const memo = await prisma.memo.findFirst({
      where: { id, userId: userId },
    });
    if (!memo) {
      return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    }
    const updated = await prisma.memo.update({
      where: { id },
      data: {
        title: body.title ?? memo.title,
        content: body.content ?? memo.content,
      },
    });
    return NextResponse.json(updated);
  });
}

// メモ削除
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = req.headers.get('x-user-id') ?? '';
  const id = Number((await params).id);
  return queryErrorHandler.errorHandling(async () => {
    const memo = await prisma.memo.findFirst({
      where: { id, userId },
    });
    if (!memo) {
      return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    }
    await prisma.memo.delete({ where: { id } });
    return NextResponse.json({ id });
  });
}
