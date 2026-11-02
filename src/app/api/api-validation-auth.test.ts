import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as retryPost } from './transactions/[id]/retry/route';
import { POST as workflowPost } from './workflows/route';
import { GET as transactionsGet } from './transactions/route';
import { GET as activityGet } from './activity/route';
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

  it('rejects unauthenticated requests on GET /api/transactions with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/transactions?page=1&pageSize=5');
    const res = await transactionsGet(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UNAUTHORIZED');
  });

  it('serves paginated transactions with valid session token and query structure', async () => {
    const adminToken = await signSession({
      userId: DEMO_USERS.admin.id,
      name: DEMO_USERS.admin.name,
      email: DEMO_USERS.admin.email,
      role: DEMO_USERS.admin.role,
    });

    const req = new NextRequest('http://localhost:3000/api/transactions?page=1&pageSize=5', {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const res = await transactionsGet(req);

    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.meta).toBeDefined();
    expect(json.meta.page).toBe(1);
    expect(json.meta.pageSize).toBe(5);
  });

  it('rejects operations_lead from viewing audit activity logs with 403 Forbidden', async () => {
    const opsToken = await signSession({
      userId: DEMO_USERS.operations_lead.id,
      name: DEMO_USERS.operations_lead.name,
      email: DEMO_USERS.operations_lead.email,
      role: DEMO_USERS.operations_lead.role,
    });

    const req = new NextRequest('http://localhost:3000/api/activity', {
      headers: {
        Authorization: `Bearer ${opsToken}`,
      },
    });
    const res = await activityGet(req);

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('FORBIDDEN');
    expect(json.error.message).toContain('ACTIVITY_VIEW');
  });

  it('allows auditor to view activity logs with 200 OK', async () => {
    const auditorToken = await signSession({
      userId: DEMO_USERS.auditor.id,
      name: DEMO_USERS.auditor.name,
      email: DEMO_USERS.auditor.email,
      role: DEMO_USERS.auditor.role,
    });

    const req = new NextRequest('http://localhost:3000/api/activity', {
      headers: {
        Authorization: `Bearer ${auditorToken}`,
      },
    });
    const res = await activityGet(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('rejects analyst from creating workflows with 403 Forbidden', async () => {
    const analystToken = await signSession({
      userId: DEMO_USERS.analyst.id,
      name: DEMO_USERS.analyst.name,
      email: DEMO_USERS.analyst.email,
      role: DEMO_USERS.analyst.role,
    });

    const req = new NextRequest('http://localhost:3000/api/workflows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${analystToken}`,
      },
      body: JSON.stringify({
        name: 'Unauthorized Rule',
        description: 'Testing RBAC rejection',
        trigger: { eventType: 'transaction_failed' },
        conditions: [{ field: 'failureReason', operator: 'eq', value: 'fraud_score_exceeded' }],
        actions: [{ type: 'freeze_account', params: {} }],
      }),
    });

    const res = await workflowPost(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('FORBIDDEN');
    expect(json.error.message).toContain('WORKFLOW_WRITE');
  });
});
