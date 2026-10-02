import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signSession, getSessionCookieOptions, SESSION_COOKIE_NAME, SESSION_LIFESPAN_MS } from '@/features/auth/lib/session';
import { DEMO_USERS, type UserRole } from '@/features/auth/types/auth.types';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types';

const loginSchema = z.object({
  role: z.enum(['admin', 'operations_lead', 'analyst', 'auditor']).optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
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

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid credentials payload.' },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { role: inputRole, email } = parsed.data;

    // Match demo user by role or email (fallback to admin)
    let selectedRole: UserRole = inputRole || 'admin';
    if (!inputRole && email) {
      const match = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (match) {
        selectedRole = match.role;
      }
    }

    const demoUser = DEMO_USERS[selectedRole];
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
        message: error instanceof Error ? error.message : 'An error occurred during authentication.',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
