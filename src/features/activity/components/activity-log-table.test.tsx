import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import * as React from 'react';
import { ActivityLogTable } from './activity-log-table';
import type { ActivityLog } from '../types/activity.types';

const mockActivityLogs: ActivityLog[] = [
  {
    id: 'act_101',
    actorId: 'usr_ops_02',
    actorName: 'Elena Vance',
    actorRole: 'operations_lead',
    action: 'TRANSACTION_RETRY',
    entityType: 'transaction',
    entityId: 'txn_0042',
    result: 'success',
    description: 'Triggered simulated retry for decline "network_timeout" with idempotency key.',
    metadata: {
      attempt: 2,
      maxRetries: 3,
      gateway: 'Stripe Direct Core',
    },
    ipAddress: '192.0.2.14',
    timestamp: '2026-11-01T13:45:10.000Z',
  },
  {
    id: 'act_102',
    actorId: 'usr_analyst_03',
    actorName: 'Marcus Brody',
    actorRole: 'analyst',
    action: 'RECONCILIATION_RESOLVE',
    entityType: 'reconciliation',
    entityId: 'rec_88319',
    result: 'success',
    description: 'Resolved fee discrepancy of -$5.00 against Chase Settlement batch #402.',
    metadata: {
      notes: 'Interchange adjustment confirmed.',
    },
    ipAddress: '198.51.100.22',
    timestamp: '2026-11-01T12:05:42.000Z',
  },
  {
    id: 'act_103',
    actorId: 'usr_risk_01',
    actorName: 'Risk Guard Core',
    actorRole: 'admin',
    action: 'DISCREPANCY_FLAGGED',
    entityType: 'transaction',
    entityId: 'txn_0019',
    result: 'flagged',
    description: 'Transaction flagged: customer risk score (78/100) exceeds threshold limit.',
    ipAddress: '10.0.4.5',
    timestamp: '2026-11-01T11:32:15.000Z',
  },
];

let activeLogs = [...mockActivityLogs];

vi.mock('../hooks/use-activity-logs', () => ({
  useActivityLogs: (params: { q?: string; action?: string; role?: string; entityType?: string; result?: string } = {}) => {
    let list = [...activeLogs];

    if (params.q) {
      const q = params.q.toLowerCase();
      list = list.filter(
        (l) =>
          l.actorName.toLowerCase().includes(q) ||
          l.entityId.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
    }
    if (params.action && params.action !== 'all') {
      list = list.filter((l) => l.action === params.action);
    }
    if (params.role && params.role !== 'all') {
      list = list.filter((l) => l.actorRole === params.role);
    }
    if (params.entityType && params.entityType !== 'all') {
      list = list.filter((l) => l.entityType === params.entityType);
    }
    if (params.result && params.result !== 'all') {
      list = list.filter((l) => l.result === params.result);
    }

    return {
      data: {
        data: list,
        meta: {
          page: 1,
          pageSize: 10,
          totalItems: list.length,
          totalPages: 1,
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
  },
}));

describe('ActivityLogTable Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    activeLogs = [...mockActivityLogs];
  });

  it('renders table headers, audit events, actors, actions, and results', () => {
    render(<ActivityLogTable />);

    expect(screen.getByText('Audit Event Log')).toBeInTheDocument();
    expect(screen.getByText('Elena Vance')).toBeInTheDocument();
    expect(screen.getByText('TRANSACTION RETRY')).toBeInTheDocument();
    expect(screen.getByText('txn_0042')).toBeInTheDocument();
    expect(screen.getByText('Marcus Brody')).toBeInTheDocument();
    expect(screen.getByText('RECONCILIATION RESOLVE')).toBeInTheDocument();
    expect(screen.getByText('rec_88319')).toBeInTheDocument();
    expect(screen.getByText('Risk Guard Core')).toBeInTheDocument();
    expect(screen.getByText('DISCREPANCY FLAGGED')).toBeInTheDocument();
  });

  it('opens detail modal when a row is clicked, displaying actor metadata and description', () => {
    render(<ActivityLogTable />);

    const row = screen.getByText('Elena Vance');
    fireEvent.click(row);

    expect(screen.getAllByText('Audit Event Log').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('act_101')).toBeInTheDocument();
    expect(screen.getAllByText(/Triggered simulated retry for decline "network_timeout"/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('192.0.2.14')).toBeInTheDocument();
    expect(screen.getByText('usr_ops_02')).toBeInTheDocument();
  });

  it('filters activity logs when an action filter is changed', () => {
    render(<ActivityLogTable />);

    const actionSelect = screen.getByLabelText(/filter by action/i);
    fireEvent.change(actionSelect, { target: { value: 'TRANSACTION_RETRY' } });

    expect(screen.getByText('Elena Vance')).toBeInTheDocument();
    expect(screen.queryByText('Marcus Brody')).not.toBeInTheDocument();
    expect(screen.queryByText('Risk Guard Core')).not.toBeInTheDocument();
  });

  it('filters activity logs when searching by actor or entity', async () => {
    vi.useFakeTimers();
    render(<ActivityLogTable />);

    const searchInput = screen.getByLabelText(/search activity logs/i);
    fireEvent.change(searchInput, { target: { value: 'rec_88319' } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByText('Marcus Brody')).toBeInTheDocument();
    expect(screen.queryByText('Elena Vance')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('renders empty state when no activity records match', () => {
    activeLogs = [];
    render(<ActivityLogTable />);

    expect(screen.getByText('No audit events found')).toBeInTheDocument();
  });
});
