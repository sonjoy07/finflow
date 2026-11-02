import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from './sidebar';

let mockRole: string = 'admin';

vi.mock('@/features/auth/hooks/use-permission', () => ({
  usePermission: () => ({
    can: (perm: string) => {
      if (mockRole === 'admin') return true;
      if (mockRole === 'operations_lead') {
        return perm !== 'ACTIVITY_VIEW';
      }
      if (mockRole === 'analyst') {
        return perm !== 'ACTIVITY_VIEW' && perm !== 'TRANSACTION_RETRY' && perm !== 'WORKFLOW_WRITE' && perm !== 'WORKFLOW_SIMULATE';
      }
      if (mockRole === 'auditor') {
        return perm !== 'TRANSACTION_RETRY' && perm !== 'RECONCILIATION_RESOLVE' && perm !== 'WORKFLOW_WRITE' && perm !== 'WORKFLOW_SIMULATE';
      }
      return false;
    },
    role: mockRole,
    isAdmin: mockRole === 'admin',
    isOperationsLead: mockRole === 'operations_lead',
    isAnalyst: mockRole === 'analyst',
    isAuditor: mockRole === 'auditor',
  }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('Sidebar Navigation RBAC Filtering', () => {
  beforeEach(() => {
    mockRole = 'admin';
  });

  it('renders all nav items for administrator including Activity Logs', () => {
    mockRole = 'admin';
    render(<Sidebar />);

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /transactions/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /reconciliation/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /workflows/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /activity logs/i })).toBeInTheDocument();
  });

  it('hides Activity Logs navigation item for operations_lead', () => {
    mockRole = 'operations_lead';
    render(<Sidebar />);

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /transactions/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /reconciliation/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /workflows/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /activity logs/i })).not.toBeInTheDocument();
  });

  it('hides Activity Logs navigation item for analyst', () => {
    mockRole = 'analyst';
    render(<Sidebar />);

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /transactions/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /activity logs/i })).not.toBeInTheDocument();
  });

  it('renders Activity Logs navigation item for auditor', () => {
    mockRole = 'auditor';
    render(<Sidebar />);

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /activity logs/i })).toBeInTheDocument();
  });
});
