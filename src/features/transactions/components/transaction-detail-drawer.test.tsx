import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { TransactionDetailDrawer } from './transaction-detail-drawer';
import type { TransactionDetail } from '../types/transaction.types';

const mockDetail: TransactionDetail = {
  id: 'tx_detail_001',
  referenceId: 'ref_finflow_001',
  amountCents: 850000,
  currency: 'USD',
  status: 'failed',
  paymentMethod: 'bank_transfer',
  paymentMethodDetails: {
    bankName: 'Silicon Valley Bank',
    accountLast4: '4141',
  },
  customer: {
    id: 'cust_001',
    name: 'SaaS Alpha Ventures',
    email: 'finance@alphaventures.com',
    tier: 'enterprise',
    riskScore: 42,
  },
  failureReason: 'Gateway response timeout after 15000ms',
  processingTimeMs: 15200,
  retryCount: 0,
  maxRetriesAllowed: 3,
  idempotencyKey: 'idem_initial_999',
  createdAt: '2026-03-15T09:00:00Z',
  updatedAt: '2026-03-15T09:00:15Z',
  gatewayResponse: {
    gateway: 'Stripe Direct',
    gatewayTransactionId: 'ch_test_123',
    rawCode: 'GATEWAY_TIMEOUT',
    rawMessage: 'Upstream connector did not respond in time',
    networkLatencyMs: 15200,
    rawPayload: { simulated: true, originalAttempt: 1 },
  },
  timeline: [
    {
      id: 'tl_01',
      event: 'TRANSACTION_INITIATED',
      timestamp: '2026-03-15T09:00:00Z',
      description: 'Transaction authorized by customer',
      actor: 'Customer Checkout',
    },
    {
      id: 'tl_02',
      event: 'GATEWAY_ROUTED',
      timestamp: '2026-03-15T09:00:01Z',
      description: 'Routed to Silicon Valley Bank via ACH',
      actor: 'FinFlow Router',
    },
    {
      id: 'tl_03',
      event: 'GATEWAY_TIMEOUT',
      timestamp: '2026-03-15T09:00:15Z',
      description: 'Gateway response timeout after 15000ms',
      actor: 'Gateway Listener',
    },
  ],
};

let activeMockDetail: TransactionDetail | undefined = mockDetail;
let mockCanRetry = true;

vi.mock('@/features/auth/hooks/use-permission', () => ({
  usePermission: () => ({
    can: (permission: string) => (permission === 'TRANSACTION_RETRY' ? mockCanRetry : true),
    role: mockCanRetry ? 'admin' : 'auditor',
    isAdmin: mockCanRetry,
    isOperationsLead: false,
    isAnalyst: false,
    isAuditor: !mockCanRetry,
  }),
}));

vi.mock('../hooks/use-transaction-detail', () => ({
  useTransactionDetail: (id: string | null) => ({
    data: id ? activeMockDetail : undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('../hooks/use-retry-transaction', () => ({
  useRetryTransaction: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ success: true }),
    isPending: false,
    isError: false,
  }),
}));

describe('TransactionDetailDrawer', () => {
  it('renders nothing visible when selectedId is null', () => {
    render(<TransactionDetailDrawer selectedId={null} onClose={vi.fn()} />);
    expect(screen.queryByText('SaaS Alpha Ventures')).not.toBeInTheDocument();
  });

  it('renders transaction details, customer info, execution metadata, and timeline', () => {
    activeMockDetail = mockDetail;
    render(<TransactionDetailDrawer selectedId="tx_detail_001" onClose={vi.fn()} />);

    expect(screen.getByText(/tx_detail_001/i)).toBeInTheDocument();
    expect(screen.getByText('SaaS Alpha Ventures')).toBeInTheDocument();
    expect(screen.getByText('$8,500.00')).toBeInTheDocument();
    expect(screen.getByText('Silicon Valley Bank')).toBeInTheDocument();
    expect(screen.getByText(/4141/)).toBeInTheDocument();
    expect(screen.getAllByText('Gateway response timeout after 15000ms').length).toBeGreaterThanOrEqual(1);

    // Execution metadata checks
    expect(screen.getByText('Stripe Direct')).toBeInTheDocument();
    expect(screen.getByText('15,200 ms')).toBeInTheDocument();
    expect(screen.getByText('ch_test_123')).toBeInTheDocument();

    // Timeline checks
    expect(screen.getByText('Transaction authorized by customer')).toBeInTheDocument();
    expect(screen.getByText('Routed to Silicon Valley Bank via ACH')).toBeInTheDocument();
  });

  it('displays retry button for eligible failed transactions', () => {
    activeMockDetail = { ...mockDetail, status: 'failed', retryCount: 1, maxRetriesAllowed: 3 };
    render(<TransactionDetailDrawer selectedId="tx_detail_001" onClose={vi.fn()} />);

    const retryBtn = screen.getByRole('button', { name: /simulate smart retry/i });
    expect(retryBtn).toBeInTheDocument();
  });

  it('hides retry button and displays informative status for ineligible settled transactions', () => {
    activeMockDetail = { ...mockDetail, status: 'settled', retryCount: 0 };
    render(<TransactionDetailDrawer selectedId="tx_detail_001" onClose={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /simulate smart retry/i })).not.toBeInTheDocument();
    expect(screen.getByText(/transaction settled\. no retry required\./i)).toBeInTheDocument();
  });

  it('hides retry button and shows warning when retry limit is exhausted', () => {
    mockCanRetry = true;
    activeMockDetail = { ...mockDetail, status: 'failed', retryCount: 3, maxRetriesAllowed: 3 };
    render(<TransactionDetailDrawer selectedId="tx_detail_001" onClose={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /simulate smart retry/i })).not.toBeInTheDocument();
    expect(screen.getByText(/max retries exhausted \(3\/3\)/i)).toBeInTheDocument();
  });

  it('hides retry button and shows permission restriction message when user lacks TRANSACTION_RETRY permission', () => {
    mockCanRetry = false;
    activeMockDetail = { ...mockDetail, status: 'failed', retryCount: 1, maxRetriesAllowed: 3 };
    render(<TransactionDetailDrawer selectedId="tx_detail_001" onClose={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /simulate smart retry/i })).not.toBeInTheDocument();
    expect(screen.getByText(/retry action restricted: operator lacks transaction_retry permission/i)).toBeInTheDocument();
    mockCanRetry = true;
  });
});
