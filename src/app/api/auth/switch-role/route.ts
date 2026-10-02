import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signSession, getSessionCookieOptions, SESSION_COOKIE_NAME, SESSION_LIFESPAN_MS } from '@/features/auth/lib/session';
import { DEMO_USERS } from '@/features/auth/types/auth.types';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types';

const switchSchema = z.object({
  role: z.enum(['admin', 'operations_lead', 'analyst', 'auditor']),
});

export async function POST(request: NextRequest) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const parsed = switchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid target role.' },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { role } = parsed.data;
    const demoUser = DEMO_USERS[role];

    const token = await signSession({
      userId: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      role: demoUser.role,
    });

    const expiresAt = Date.now() + SESSION_LIFESPAN_MS;
    const cookieOptions = getSessionCookieOptions(expiresAt);

    const response: ApiSuccessResponse<typeof demoUser> = {
      success: true,
      data: demoUser,
      timestamp: new Date().toISOString(),
    };

    const res = NextResponse.json(response, { status: 200 });
    res.cookies.set(SESSION_COOKIE_NAME, token, cookieOptions);
    return res;
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Error switching persona role.',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
