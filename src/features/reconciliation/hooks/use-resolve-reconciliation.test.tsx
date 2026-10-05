import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useResolveReconciliation } from './use-resolve-reconciliation';
import * as reconciliationApi from '../api/reconciliation-api';
import { reconciliationKeys, dashboardKeys } from '@/lib/query-keys';
import { useToastStore } from '@/stores/toast-store';

describe('useResolveReconciliation', () => {
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

  it('resolves discrepancy, updates cache, invalidates queries, and dispatches toast', async () => {
    const mockResolved = {
      id: 'rec_test_01',
      batchId: 'batch_test_01',
      internalTransactionId: 'txn_01',
      externalGatewayReference: 'ext_01',
      gatewayName: 'Chase',
      internalAmountCents: 10000,
      externalAmountCents: 10000,
      feeDeductedCents: 200,
      netSettledCents: 9800,
      currency: 'USD',
      matchStatus: 'resolved' as const,
      discrepancyDeltaCents: 0,
      settledAt: '2026-11-01T00:00:00Z',
      resolvedAt: '2026-11-01T01:00:00Z',
      resolutionNotes: 'Approved variance',
    };

    const resolveSpy = vi
      .spyOn(reconciliationApi, 'resolveReconciliationDiscrepancy')
      .mockResolvedValueOnce(mockResolved);

    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useResolveReconciliation(), { wrapper });

    await result.current.mutateAsync({
      id: 'rec_test_01',
      notes: 'Approved variance',
      action: 'force_match',
    });

    expect(resolveSpy).toHaveBeenCalledWith({
      id: 'rec_test_01',
      notes: 'Approved variance',
      action: 'force_match',
    });

    // Detail cache updated directly
    expect(setQueryDataSpy).toHaveBeenCalledWith(
      reconciliationKeys.detail('rec_test_01'),
      mockResolved
    );

    // Invalidation of reconciliation and dashboard queries
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: reconciliationKeys.all,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: dashboardKeys.all,
    });

    // Toast notification check
    const toasts = useToastStore.getState().toasts;
    expect(toasts.length).toBe(1);
    expect(toasts[0]?.type).toBe('success');
    expect(toasts[0]?.title).toBe('Discrepancy Resolved');
  });

  it('handles resolution API rejection and dispatches error toast', async () => {
    vi.spyOn(reconciliationApi, 'resolveReconciliationDiscrepancy').mockRejectedValueOnce(
      new Error('Record is locked by concurrent reconciliation process')
    );

    const { result } = renderHook(() => useResolveReconciliation(), { wrapper });

    await expect(
      result.current.mutateAsync({
        id: 'rec_locked_01',
        notes: 'Locked record override',
      })
    ).rejects.toThrow('Record is locked by concurrent reconciliation process');

    const toasts = useToastStore.getState().toasts;
    expect(toasts.length).toBe(1);
    expect(toasts[0]?.type).toBe('error');
    expect(toasts[0]?.title).toBe('Resolution Failed');
  });
});
