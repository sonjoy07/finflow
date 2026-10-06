import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE_NAME } from './session';
import { hasPermission } from './permissions';
import type { SessionPayload, Permission } from '../types/auth.types';
import type { ApiErrorResponse } from '@/types';

export interface AuthResult {
  session?: SessionPayload;
  errorResponse?: NextResponse<ApiErrorResponse>;
}

export async function authenticateRequest(
  request: NextRequest,
  requiredPermission?: Permission
): Promise<AuthResult> {
  let token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication session required. Please sign in.',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      ),
    };
  }

  let session: SessionPayload;
  try {
    session = await verifySession(token);
  } catch (err) {
    const isExpired = err instanceof Error && err.message === 'EXPIRED_SESSION';
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: isExpired ? 'SESSION_EXPIRED' : 'UNAUTHORIZED',
            message: isExpired
              ? 'Session has expired. Please sign in again.'
              : 'Invalid or tampered session token.',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      ),
    };
  }

  if (requiredPermission && !hasPermission(session.role, requiredPermission)) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Role '${session.role}' lacks permission '${requiredPermission}'.`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      ),
    };
  }

  return { session };
}
