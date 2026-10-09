import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import * as React from 'react';
import { RetryTransactionModal } from './retry-transaction-modal';
import type { TransactionDetail } from '../types/transaction.types';

const mockTransaction: TransactionDetail = {
  id: 'tx_failed_001',
  referenceId: 'ref_finflow_999',
  amountCents: 450000,
  currency: 'USD',
  status: 'failed',
  paymentMethod: 'card',
  paymentMethodDetails: { brand: 'Mastercard', last4: '5555' },
  customer: {
    id: 'cust_01',
    name: 'Omni Retail Inc',
    email: 'finance@omniretail.com',
    tier: 'enterprise',
    riskScore: 28,
  },
  failureReason: 'Card processor declined due to network timeout',
  processingTimeMs: 1420,
  retryCount: 1,
  maxRetriesAllowed: 3,
  createdAt: '2026-03-15T08:00:00Z',
  updatedAt: '2026-03-15T08:00:02Z',
  timeline: [],
};

const mockMutateAsync = vi.fn();
let isPendingMock = false;
let isErrorMock = false;
let errorMock: Error | null = null;

vi.mock('../hooks/use-retry-transaction', () => ({
  useRetryTransaction: () => ({
    mutateAsync: mockMutateAsync,
    isPending: isPendingMock,
    isError: isErrorMock,
    error: errorMock,
  }),
}));

describe('RetryTransactionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isPendingMock = false;
    isErrorMock = false;
    errorMock = null;
  });

  it('renders confirmation modal with transaction details and simulated sandbox notice', () => {
    render(
      <RetryTransactionModal
        isOpen={true}
        onClose={vi.fn()}
        transaction={mockTransaction}
      />
    );

    expect(screen.getByText('Simulate Transaction Retry')).toBeInTheDocument();
    expect(screen.getByText(/Simulated Financial Environment/i)).toBeInTheDocument();
    expect(screen.getByText('tx_failed_001')).toBeInTheDocument();
    expect(screen.getByText('Omni Retail Inc')).toBeInTheDocument();
    expect(screen.getByText('$4,500.00')).toBeInTheDocument();
    expect(screen.getByText(/Attempt 2 of 3/i)).toBeInTheDocument();
  });

  it('handles eligible retry dispatch with operator notes and idempotency key', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      success: true,
      transaction: { ...mockTransaction, status: 'processing', retryCount: 2 },
    });

    const onClose = vi.fn();
    render(
      <RetryTransactionModal
        isOpen={true}
        onClose={onClose}
        transaction={mockTransaction}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /confirm & dispatch retry/i });
    expect(submitBtn).toBeEnabled();

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'tx_failed_001',
        idempotencyKey: expect.stringMatching(/^idem_tx_failed_001_/),
        notes: expect.any(String),
      })
    );
  });

  it('prevents duplicate submissions on rapid multiple clicks', async () => {
    let resolveMutation: (val: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveMutation = resolve;
    });
    mockMutateAsync.mockReturnValue(pendingPromise);

    render(
      <RetryTransactionModal
        isOpen={true}
        onClose={vi.fn()}
        transaction={mockTransaction}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /confirm & dispatch retry/i });

    // Click multiple times rapidly
    await act(async () => {
      fireEvent.click(submitBtn);
      fireEvent.click(submitBtn);
      fireEvent.click(submitBtn);
    });

    // Only one call should be dispatched
    expect(mockMutateAsync).toHaveBeenCalledTimes(1);

    // Resolve the mutation
    await act(async () => {
      resolveMutation!({ success: true, transaction: mockTransaction });
    });
  });

  it('displays API error feedback when retry mutation fails', () => {
    isErrorMock = true;
    errorMock = new Error('Upstream mock declined retry with code ACQUIRING_ROUTE_DOWN');

    render(
      <RetryTransactionModal
        isOpen={true}
        onClose={vi.fn()}
        transaction={mockTransaction}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Retry Request Rejected/i)).toBeInTheDocument();
    expect(
      screen.getByText('Upstream mock declined retry with code ACQUIRING_ROUTE_DOWN')
    ).toBeInTheDocument();
  });

  it('allows canceling without triggering mutation', () => {
    const onClose = vi.fn();
    render(
      <RetryTransactionModal
        isOpen={true}
        onClose={onClose}
        transaction={mockTransaction}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(onClose).toHaveBeenCalled();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
