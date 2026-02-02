import { NextResponse } from 'next/server';

// DB処理実行
async function errorHandling(
  func: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await func();
  } catch (e: unknown) {
    console.error('Database error:', e);
    return NextResponse.json(
      { error: `Database error: ${String(e)}` },
      { status: 500 }
    );
  }
}

export const queryErrorHandler = {
  errorHandling,
};
