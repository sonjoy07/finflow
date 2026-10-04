import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executeTransactionRetry } from '../api/transactions-api';
import { transactionKeys } from '../api/transaction-keys';
import { dashboardKeys } from '@/features/dashboard/api/dashboard-keys';
import { useToastStore } from '@/stores/toast-store';
import type { ApiError } from '@/lib/api-client';

export interface RetryParams {
  id: string;
  idempotencyKey: string;
  notes?: string;
}

export function useRetryTransaction() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({ id, idempotencyKey, notes }: RetryParams) =>
      executeTransactionRetry(id, idempotencyKey, notes),
    onSuccess: (data, variables) => {
      // 1. Immediately update specific transaction detail cache
      queryClient.setQueryData(
        transactionKeys.detail(variables.id),
        data.transaction
      );

      // 2. Invalidate transactions list cache to reflect updated status
      queryClient.invalidateQueries({
        queryKey: transactionKeys.lists(),
      });

      // 3. Invalidate dashboard metrics cache (failure count & pending count changed)
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
      });

      addToast({
        type: 'success',
        title: 'Retry Scheduled',
        message: `Transaction ${variables.id} retry simulation accepted by acquiring mock.`,
      });
    },
    onError: (error: ApiError | Error) => {
      addToast({
        type: 'error',
        title: 'Retry Failed',
        message: error.message || 'Unable to schedule transaction retry.',
      });
    },
  });
}
