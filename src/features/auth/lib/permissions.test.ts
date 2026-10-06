import { describe, it, expect } from 'vitest';
import { hasPermission, assertPermission } from './permissions';
import type { SessionPayload } from '../types/auth.types';

describe('Role-Based Access Control (RBAC) Permissions', () => {
  it('allows full permissions for admin role', () => {
    expect(hasPermission('admin', 'TRANSACTION_VIEW')).toBe(true);
    expect(hasPermission('admin', 'TRANSACTION_RETRY')).toBe(true);
    expect(hasPermission('admin', 'RECONCILIATION_RESOLVE')).toBe(true);
    expect(hasPermission('admin', 'WORKFLOW_WRITE')).toBe(true);
    expect(hasPermission('admin', 'ACTIVITY_VIEW')).toBe(true);
  });

  it('allows operations_lead to retry and resolve breaks, but denies activity viewing', () => {
    expect(hasPermission('operations_lead', 'TRANSACTION_RETRY')).toBe(true);
    expect(hasPermission('operations_lead', 'RECONCILIATION_RESOLVE')).toBe(true);
    expect(hasPermission('operations_lead', 'WORKFLOW_WRITE')).toBe(true);
    expect(hasPermission('operations_lead', 'ACTIVITY_VIEW')).toBe(false);
  });

  it('allows analyst to resolve discrepancies, but forbids retries and workflow editing', () => {
    expect(hasPermission('analyst', 'RECONCILIATION_RESOLVE')).toBe(true);
    expect(hasPermission('analyst', 'TRANSACTION_VIEW')).toBe(true);
    expect(hasPermission('analyst', 'TRANSACTION_RETRY')).toBe(false);
    expect(hasPermission('analyst', 'WORKFLOW_WRITE')).toBe(false);
  });

  it('restricts auditor to read-only access (all write mutations denied)', () => {
    expect(hasPermission('auditor', 'TRANSACTION_VIEW')).toBe(true);
    expect(hasPermission('auditor', 'RECONCILIATION_VIEW')).toBe(true);
    expect(hasPermission('auditor', 'ACTIVITY_VIEW')).toBe(true);
    expect(hasPermission('auditor', 'TRANSACTION_RETRY')).toBe(false);
    expect(hasPermission('auditor', 'RECONCILIATION_RESOLVE')).toBe(false);
    expect(hasPermission('auditor', 'WORKFLOW_WRITE')).toBe(false);
  });

  it('assertPermission throws informative error on unauthorized role', () => {
    const mockAnalystSession: SessionPayload = {
      userId: 'u3',
      name: 'Marcus',
      email: 'analyst@finflow.io',
      role: 'analyst',
      issuedAt: Date.now(),
      expiresAt: Date.now() + 10000,
    };

    expect(() => assertPermission(mockAnalystSession, 'TRANSACTION_RETRY')).toThrow(
      "Role 'analyst' lacks permission 'TRANSACTION_RETRY'."
    );
  });
});
