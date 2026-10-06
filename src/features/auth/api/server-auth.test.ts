import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { authenticateRequest } from '../lib/server-auth';
import { signSession, SESSION_COOKIE_NAME } from '../lib/session';

describe('Server-Side Authentication & Authorization Guard', () => {
  it('returns 401 Unauthorized when no session cookie is provided', async () => {
    const request = new NextRequest('http://localhost:3000/api/transactions/txn_01/retry', {
      method: 'POST',
    });

    const { session, errorResponse } = await authenticateRequest(request, 'TRANSACTION_RETRY');
    expect(session).toBeUndefined();
    expect(errorResponse).toBeDefined();
    expect(errorResponse?.status).toBe(401);

    const data = await errorResponse?.json();
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 Session Expired when session token has expired', async () => {
    const expiredToken = await signSession(
      { userId: 'u1', name: 'Sarah', email: 'admin@finflow.io', role: 'admin' },
      -5000 // expired
    );

    const request = new NextRequest('http://localhost:3000/api/transactions/txn_01/retry', {
      method: 'POST',
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${expiredToken}`,
      },
    });

    const { session, errorResponse } = await authenticateRequest(request, 'TRANSACTION_RETRY');
    expect(session).toBeUndefined();
    expect(errorResponse?.status).toBe(401);

    const data = await errorResponse?.json();
    expect(data.error.code).toBe('SESSION_EXPIRED');
  });

  it('returns 403 Forbidden when role lacks required permission', async () => {
    const analystToken = await signSession({
      userId: 'u3',
      name: 'Marcus',
      email: 'analyst@finflow.io',
      role: 'analyst',
    });

    const request = new NextRequest('http://localhost:3000/api/transactions/txn_01/retry', {
      method: 'POST',
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${analystToken}`,
      },
    });

    // Analyst does NOT have TRANSACTION_RETRY permission
    const { session, errorResponse } = await authenticateRequest(request, 'TRANSACTION_RETRY');
    expect(session).toBeUndefined();
    expect(errorResponse?.status).toBe(403);

    const data = await errorResponse?.json();
    expect(data.error.code).toBe('FORBIDDEN');
    expect(data.error.message).toContain("Role 'analyst' lacks permission 'TRANSACTION_RETRY'");
  });

  it('successfully authorizes when role possesses required permission', async () => {
    const opsLeadToken = await signSession({
      userId: 'u2',
      name: 'Elena',
      email: 'ops@finflow.io',
      role: 'operations_lead',
    });

    const request = new NextRequest('http://localhost:3000/api/transactions/txn_01/retry', {
      method: 'POST',
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${opsLeadToken}`,
      },
    });

    // Operations Lead HAS TRANSACTION_RETRY permission
    const { session, errorResponse } = await authenticateRequest(request, 'TRANSACTION_RETRY');
    expect(errorResponse).toBeUndefined();
    expect(session).toBeDefined();
    expect(session?.role).toBe('operations_lead');
  });
});
