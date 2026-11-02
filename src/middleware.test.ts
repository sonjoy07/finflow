import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';
import { signSession, SESSION_COOKIE_NAME } from '@/features/auth/lib/session';
import { DEMO_USERS } from '@/features/auth/types/auth.types';

describe('Middleware Route Protection and RBAC Gating', () => {
  it('redirects unauthenticated user accessing /dashboard to /login', async () => {
    const req = new NextRequest('http://localhost:3000/dashboard');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('from=%2Fdashboard');
  });

  it('allows authenticated admin to access /activity', async () => {
    const token = await signSession({
      userId: DEMO_USERS.admin.id,
      name: DEMO_USERS.admin.name,
      email: DEMO_USERS.admin.email,
      role: 'admin',
    });

    const req = new NextRequest('http://localhost:3000/activity', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${token}`,
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(200); // NextResponse.next()
  });

  it('redirects operations_lead attempting direct URL access to /activity to /forbidden', async () => {
    const token = await signSession({
      userId: DEMO_USERS.operations_lead.id,
      name: DEMO_USERS.operations_lead.name,
      email: DEMO_USERS.operations_lead.email,
      role: 'operations_lead',
    });

    const req = new NextRequest('http://localhost:3000/activity', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${token}`,
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/forbidden');
    expect(location).toContain('required=ACTIVITY_VIEW');
    expect(location).toContain('role=operations_lead');
    expect(location).toContain('from=%2Factivity');
  });

  it('allows auditor to access /activity', async () => {
    const token = await signSession({
      userId: DEMO_USERS.auditor.id,
      name: DEMO_USERS.auditor.name,
      email: DEMO_USERS.auditor.email,
      role: 'auditor',
    });

    const req = new NextRequest('http://localhost:3000/activity', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${token}`,
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it('redirects authenticated user visiting /login directly to /dashboard', async () => {
    const token = await signSession({
      userId: DEMO_USERS.admin.id,
      name: DEMO_USERS.admin.name,
      email: DEMO_USERS.admin.email,
      role: 'admin',
    });

    const req = new NextRequest('http://localhost:3000/login', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${token}`,
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/dashboard');
  });
});
