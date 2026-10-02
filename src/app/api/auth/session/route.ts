import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE_NAME } from '@/features/auth/lib/session';
import { DEMO_USERS } from '@/features/auth/types/auth.types';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'No active session found.' },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    try {
      const payload = await verifySession(token);
      const demoUser = DEMO_USERS[payload.role] || {
        id: payload.userId,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        title: 'Fintech Operator',
        description: '',
        badgeVariant: 'secondary' as const,
      };

      const response: ApiSuccessResponse<typeof demoUser> = {
        success: true,
        data: demoUser,
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 200 });
    } catch (err) {
      const isExpired = err instanceof Error && err.message === 'EXPIRED_SESSION';
      const res = NextResponse.json(
        {
          success: false,
          error: {
            code: isExpired ? 'SESSION_EXPIRED' : 'UNAUTHORIZED',
            message: isExpired ? 'Session has expired.' : 'Invalid session signature.',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
      // Clear invalid cookie
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Session verification failed.',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
