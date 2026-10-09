import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import * as React from 'react';
import { RetryTransactionModal } from './retry-transaction-modal';
import {
  mockFailedCardTransaction,
  mockSettledBankTransaction,
  mockExhaustedRetryTransaction,
} from '../../../../tests/fixtures/transactions.fixture';

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

describe('Transaction Retry Eligibility and Mutation Error Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isPendingMock = false;
    isErrorMock = false;
    errorMock = null;
  });

  it('evaluates retry eligibility correctly across transaction states and retry counts', () => {
    const isEligible = (tx: typeof mockFailedCardTransaction) =>
      tx.status === 'failed' && tx.retryCount < tx.maxRetriesAllowed;

    expect(isEligible(mockFailedCardTransaction)).toBe(true);
    expect(isEligible(mockSettledBankTransaction)).toBe(false);
    expect(isEligible(mockExhaustedRetryTransaction)).toBe(false);
  });

  it('renders retry modal with fixture transaction details and pre-populates idempotency key', () => {
    render(
      <RetryTransactionModal
        isOpen={true}
        onClose={vi.fn()}
        transaction={mockFailedCardTransaction}
      />
    );

    expect(screen.getByText('Simulate Transaction Retry')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText(/Attempt 2 of 3/i)).toBeInTheDocument();

    const idempotencyInput = screen.getByLabelText(/Generated idempotency key/i) as HTMLInputElement;
    expect(idempotencyInput.value).toMatch(/^idem_txn_test_001_/);
  });

  it('allows adding valid audit note and submitting retry mutation', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      success: true,
      transaction: { ...mockFailedCardTransaction, status: 'processing', retryCount: 2 },
    });

    render(
      <RetryTransactionModal
        isOpen={true}
        onClose={vi.fn()}
        transaction={mockFailedCardTransaction}
      />
    );

    const notesInput = screen.getByLabelText(/Operator Audit Justification/i);
    fireEvent.change(notesInput, {
      target: { value: 'Verified customer card updated; initiating sandbox retry.' },
    });

    const submitBtn = screen.getByRole('button', { name: /confirm & dispatch retry/i });
    expect(submitBtn).toBeEnabled();

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'txn_test_001',
        idempotencyKey: expect.stringMatching(/^idem_txn_test_001_/),
        notes: 'Verified customer card updated; initiating sandbox retry.',
      })
    );
  });

  it('displays error banner when retry mutation fails with acquiring network error', () => {
    isErrorMock = true;
    errorMock = new Error('Upstream mock declined retry with code ACQUIRING_ROUTE_DOWN');

    render(
      <RetryTransactionModal
        isOpen={true}
        onClose={vi.fn()}
        transaction={mockFailedCardTransaction}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Retry Request Rejected/i)).toBeInTheDocument();
    expect(
      screen.getByText('Upstream mock declined retry with code ACQUIRING_ROUTE_DOWN')
    ).toBeInTheDocument();
  });
});
