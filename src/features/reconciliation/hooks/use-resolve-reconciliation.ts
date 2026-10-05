import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveReconciliationDiscrepancy } from '../api/reconciliation-api';
import { reconciliationKeys, dashboardKeys } from '@/lib/query-keys';
import { useToastStore } from '@/stores/toast-store';
import type { ResolveReconciliationParams, ReconciliationRecord } from '../types/reconciliation.types';
import type { ApiError } from '@/lib/api-client';

export function useResolveReconciliation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: (params: ResolveReconciliationParams) =>
      resolveReconciliationDiscrepancy(params),
    onSuccess: (updatedRecord: ReconciliationRecord) => {
      // 1. Immediately update record in detail cache
      queryClient.setQueryData(
        reconciliationKeys.detail(updatedRecord.id),
        updatedRecord
      );

      // 2. Invalidate reconciliation lists & summaries
      queryClient.invalidateQueries({
        queryKey: reconciliationKeys.all,
      });

      // 3. Invalidate dashboard metrics as settled balances or discrepancy totals shifted
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
      });

      addToast({
        type: 'success',
        title: 'Discrepancy Resolved',
        message: `Record ${updatedRecord.id} (Batch ${updatedRecord.batchId}) marked as resolved.`,
      });
    },
    onError: (error: ApiError | Error) => {
      addToast({
        type: 'error',
        title: 'Resolution Failed',
        message: error.message || 'Unable to submit manual reconciliation decision.',
      });
    },
  });
}
