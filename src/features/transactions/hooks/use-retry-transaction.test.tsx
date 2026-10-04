import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRetryTransaction } from './use-retry-transaction';
import * as transactionsApi from '../api/transactions-api';
import { transactionKeys } from '../api/transaction-keys';
import { dashboardKeys } from '@/features/dashboard/api/dashboard-keys';
import { useToastStore } from '@/stores/toast-store';

describe('useRetryTransaction', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    useToastStore.getState().clearToasts();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('executes retry mutation, updates detail cache, and invalidates list and dashboard queries', async () => {
    const mockUpdatedTx = {
      id: 'tx_123',
      referenceId: 'ref_123',
      amountCents: 10000,
      currency: 'USD' as const,
      status: 'processing' as const,
      paymentMethod: 'card' as const,
      paymentMethodDetails: {},
      customer: { id: 'c1', name: 'Acme', email: 'a@b.com', tier: 'standard' as const, riskScore: 10 },
      failureReason: null,
      processingTimeMs: 500,
      retryCount: 1,
      maxRetriesAllowed: 3,
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:01:00Z',
      timeline: [],
    };

    const executeSpy = vi.spyOn(transactionsApi, 'executeTransactionRetry').mockResolvedValueOnce({
      transaction: mockUpdatedTx,
      executionId: 'exec_123',
      status: 'processing',
      gatewayMessage: 'Retry scheduled',
    });

    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRetryTransaction(), { wrapper });

    await result.current.mutateAsync({
      id: 'tx_123',
      idempotencyKey: 'idem_key_123',
      notes: 'Test retry note',
    });

    expect(executeSpy).toHaveBeenCalledWith('tx_123', 'idem_key_123', 'Test retry note');

    // Verify detail cache updated directly
    expect(setQueryDataSpy).toHaveBeenCalledWith(
      transactionKeys.detail('tx_123'),
      mockUpdatedTx
    );

    // Verify query invalidations
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: transactionKeys.lists(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: dashboardKeys.all,
    });

    // Verify success toast added
    const toasts = useToastStore.getState().toasts;
    expect(toasts.length).toBe(1);
    expect(toasts[0]?.type).toBe('success');
    expect(toasts[0]?.title).toBe('Retry Scheduled');
  });

  it('handles mutation errors and triggers error toast notification', async () => {
    vi.spyOn(transactionsApi, 'executeTransactionRetry').mockRejectedValueOnce(
      new Error('Transaction already resolved')
    );

    const { result } = renderHook(() => useRetryTransaction(), { wrapper });

    await expect(
      result.current.mutateAsync({
        id: 'tx_conflict_123',
        idempotencyKey: 'idem_key_999',
      })
    ).rejects.toThrow('Transaction already resolved');

    const toasts = useToastStore.getState().toasts;
    expect(toasts.length).toBe(1);
    expect(toasts[0]?.type).toBe('error');
    expect(toasts[0]?.title).toBe('Retry Failed');
  });
});
