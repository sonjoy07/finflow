import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as retryPost } from './transactions/[id]/retry/route';
import { POST as workflowPost } from './workflows/route';
import { GET as transactionsGet } from './transactions/route';
import { signSession } from '@/features/auth/lib/session';
import { DEMO_USERS } from '@/features/auth/types/auth.types';

describe('API Route Validation and Authorization Controls', () => {
  it('rejects unauthenticated requests on protected mutation with 401 Unauthorized', async () => {
    const req = new NextRequest('http://localhost:3000/api/transactions/txn_001/retry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Customer requested manual retry' }),
    });

    const res = await retryPost(req, { params: { id: 'txn_001' } });
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects unauthorized roles (e.g. auditor) on mutation with 403 Forbidden', async () => {
    const auditorToken = await signSession({
      userId: DEMO_USERS.auditor.id,
      name: DEMO_USERS.auditor.name,
      email: DEMO_USERS.auditor.email,
      role: DEMO_USERS.auditor.role,
    });

    const req = new NextRequest('http://localhost:3000/api/transactions/txn_001/retry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auditorToken}`,
      },
      body: JSON.stringify({ reason: 'Auditor attempting unauthorized retry' }),
    });

    const res = await retryPost(req, { params: { id: 'txn_001' } });
    expect(res.status).toBe(403);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('FORBIDDEN');
    expect(json.error.message).toMatch(/lacks permission/i);
  });

  it('validates workflow creation payload with Zod schema and rejects invalid bodies', async () => {
    const adminToken = await signSession({
      userId: DEMO_USERS.admin.id,
      name: DEMO_USERS.admin.name,
      email: DEMO_USERS.admin.email,
      role: DEMO_USERS.admin.role,
    });

    // Missing required fields
    const req = new NextRequest('http://localhost:3000/api/workflows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Incomplete Rule',
        // missing trigger, conditions, actions
      }),
    });

    const res = await workflowPost(req);
    expect(res.status).toBe(422);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('serves paginated transactions with valid query structure', async () => {
    const req = new NextRequest('http://localhost:3000/api/transactions?page=1&pageSize=5');
    const res = await transactionsGet(req);

    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.meta).toBeDefined();
    expect(json.meta.page).toBe(1);
    expect(json.meta.pageSize).toBe(5);
  });
});
