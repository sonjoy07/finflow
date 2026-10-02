import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/features/auth/lib/session';
import type { ApiSuccessResponse } from '@/types';

export async function POST() {
  const response: ApiSuccessResponse<{ loggedOut: boolean }> = {
    success: true,
    data: { loggedOut: true },
    timestamp: new Date().toISOString(),
  };

  const res = NextResponse.json(response, { status: 200 });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
