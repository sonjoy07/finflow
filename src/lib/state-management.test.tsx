import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from './query-client';
import { useRetryTransaction } from '@/features/transactions/hooks/use-retry-transaction';
import * as transactionsApi from '@/features/transactions/api/transactions-api';
import {
  transactionKeys,
  dashboardKeys,
  reconciliationKeys,
  workflowKeys,
} from './query-keys';

describe('State Management Architecture & Invalidation Policies', () => {
  let queryClient = createQueryClient();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createQueryClient();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('guarantees targeted query invalidation and preserves unrelated caches', async () => {
    // Populate cache with multiple domains
    queryClient.setQueryData(transactionKeys.list({ page: 1, pageSize: 25 }), {
      data: [{ id: 'tx_old' }],
      meta: { page: 1, totalItems: 1 },
    });
    queryClient.setQueryData(dashboardKeys.metrics('7d'), { totalVolumeCents: 500000 });
    queryClient.setQueryData(reconciliationKeys.lists(), { items: [{ id: 'rec_01' }] });
    queryClient.setQueryData(workflowKeys.lists(), { workflows: [{ id: 'wf_01' }] });

    const mockUpdatedTx = {
      id: 'tx_target_999',
      referenceId: 'ref_999',
      amountCents: 25000,
      currency: 'USD' as const,
      status: 'processing' as const,
      paymentMethod: 'card' as const,
      paymentMethodDetails: {},
      customer: {
        id: 'c1',
        name: 'Delta Corp',
        email: 'delta@corp.com',
        tier: 'enterprise' as const,
        riskScore: 15,
      },
      failureReason: null,
      processingTimeMs: 400,
      retryCount: 1,
      maxRetriesAllowed: 3,
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:01:00Z',
      timeline: [],
    };

    vi.spyOn(transactionsApi, 'executeTransactionRetry').mockResolvedValueOnce({
      transaction: mockUpdatedTx,
      executionId: 'exec_999',
      status: 'processing',
      gatewayMessage: 'Retry queued',
    });

    const { result } = renderHook(() => useRetryTransaction(), { wrapper });

    await result.current.mutateAsync({
      id: 'tx_target_999',
      idempotencyKey: 'idem_key_targeted_test',
    });

    // 1. Transaction detail cache was immediately updated
    const detailData = queryClient.getQueryData(transactionKeys.detail('tx_target_999'));
    expect(detailData).toEqual(mockUpdatedTx);

    // 2. Transaction list query state is marked as invalidated (stale)
    const txListState = queryClient.getQueryState(transactionKeys.list({ page: 1, pageSize: 25 }));
    expect(txListState?.isInvalidated).toBe(true);

    // 3. Dashboard metrics query state is marked as invalidated (stale)
    const dashState = queryClient.getQueryState(dashboardKeys.metrics('7d'));
    expect(dashState?.isInvalidated).toBe(true);

    // 4. Unrelated domain caches remain completely intact and NOT invalidated
    const recState = queryClient.getQueryState(reconciliationKeys.lists());
    expect(recState?.isInvalidated).toBe(false);
    expect(queryClient.getQueryData(reconciliationKeys.lists())).toEqual({ items: [{ id: 'rec_01' }] });

    const wfState = queryClient.getQueryState(workflowKeys.lists());
    expect(wfState?.isInvalidated).toBe(false);
    expect(queryClient.getQueryData(workflowKeys.lists())).toEqual({ workflows: [{ id: 'wf_01' }] });
  });

  it('verifies fetchTransactions properly forwards AbortSignal for query cancellation', async () => {
    const abortController = new AbortController();

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementationOnce((_url, options) => {
      expect(options?.signal).toBe(abortController.signal);
      return Promise.resolve(
        new Response(JSON.stringify({ success: true, data: [], meta: { page: 1, totalItems: 0 } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    await transactionsApi.fetchTransactions({ page: 1 }, abortController.signal);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
