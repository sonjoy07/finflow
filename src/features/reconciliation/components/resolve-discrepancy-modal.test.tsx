import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import * as React from 'react';
import { ResolveDiscrepancyModal } from './resolve-discrepancy-modal';
import type { ReconciliationRecord } from '../types/reconciliation.types';

const mockRecord: ReconciliationRecord = {
  id: 'rec_resolve_001',
  batchId: 'batch_2026_10_25_001',
  internalTransactionId: 'txn_0001',
  externalGatewayReference: 'ext_ref_80001',
  gatewayName: 'JPMorgan Chase Clearing',
  internalAmountCents: 15000,
  externalAmountCents: 12000,
  feeDeductedCents: 264,
  netSettledCents: 11736,
  currency: 'USD',
  matchStatus: 'mismatched_amount',
  discrepancyDeltaCents: 3000,
  settledAt: '2026-11-01T10:00:00Z',
};

const mockMutateAsync = vi.fn();
let isPendingMock = false;
let isErrorMock = false;
let errorMock: Error | null = null;

vi.mock('../hooks/use-resolve-reconciliation', () => ({
  useResolveReconciliation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: isPendingMock,
    isError: isErrorMock,
    error: errorMock,
  }),
}));

describe('ResolveDiscrepancyModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isPendingMock = false;
    isErrorMock = false;
    errorMock = null;
  });

  it('renders confirmation dialog with record metadata and disclaimer', () => {
    render(
      <ResolveDiscrepancyModal
        isOpen={true}
        onClose={vi.fn()}
        record={mockRecord}
      />
    );

    expect(screen.getByText('Resolve Clearing Discrepancy')).toBeInTheDocument();
    expect(screen.getByText(/Simulated Ledger Override/i)).toBeInTheDocument();
    expect(screen.getByText('rec_resolve_001')).toBeInTheDocument();
    expect(screen.getByText('JPMorgan Chase Clearing')).toBeInTheDocument();
    expect(screen.getByText('+$30.00')).toBeInTheDocument();
  });

  it('validates notes length and displays validation error if too short', async () => {
    render(
      <ResolveDiscrepancyModal
        isOpen={true}
        onClose={vi.fn()}
        record={mockRecord}
      />
    );

    const input = screen.getByLabelText(/audit justification notes/i);
    fireEvent.change(input, { target: { value: 'abc' } });

    const submitBtn = screen.getByRole('button', { name: /confirm & resolve/i });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/must be at least 5 characters/i)).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('submits manual override with valid notes and action', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      ...mockRecord,
      matchStatus: 'resolved',
    });

    render(
      <ResolveDiscrepancyModal
        isOpen={true}
        onClose={vi.fn()}
        record={mockRecord}
      />
    );

    const input = screen.getByLabelText(/audit justification notes/i);
    fireEvent.change(input, { target: { value: 'Variance verified against physical bank slip.' } });

    const submitBtn = screen.getByRole('button', { name: /confirm & resolve/i });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: 'rec_resolve_001',
      notes: 'Variance verified against physical bank slip.',
      action: 'force_match',
    });
  });

  it('prevents duplicate clicks while mutation is in flight', async () => {
    let resolveFn: (val: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveFn = resolve;
    });
    mockMutateAsync.mockReturnValue(pendingPromise);

    render(
      <ResolveDiscrepancyModal
        isOpen={true}
        onClose={vi.fn()}
        record={mockRecord}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /confirm & resolve/i });

    await act(async () => {
      fireEvent.click(submitBtn);
      fireEvent.click(submitBtn);
      fireEvent.click(submitBtn);
    });

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFn!({ ...mockRecord, matchStatus: 'resolved' });
    });
  });

  it('displays API error feedback when mutation fails', () => {
    isErrorMock = true;
    errorMock = new Error('Record locked by another concurrent auditor session.');

    render(
      <ResolveDiscrepancyModal
        isOpen={true}
        onClose={vi.fn()}
        record={mockRecord}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Resolution Failed/i)).toBeInTheDocument();
    expect(screen.getByText('Record locked by another concurrent auditor session.')).toBeInTheDocument();
  });
});
