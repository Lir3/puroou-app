import { NextRequest } from 'next/server';

// ベースURL生成
function getBaseUrl(request: NextRequest): string {
  const headers = request.headers;
  const host = headers.get('x-forwarded-host') || headers.get('host');
  const scheme = headers.get('x-forwarded-proto') || 'http';
  console.log('getBaseUrl:', `host=${host} scheme=${scheme}`);
  return `${scheme}://${host}/`;
}

export const RequestUrlHelper = { getBaseUrl };
