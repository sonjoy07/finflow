import { useQuery } from '@tanstack/react-query';
import { reconciliationKeys } from '@/lib/query-keys';
import { fetchReconciliation } from '../api/reconciliation-api';
import type { ReconciliationFilters } from '../types/reconciliation.types';

export function useReconciliation(filters: ReconciliationFilters = {}) {
  return useQuery({
    queryKey: reconciliationKeys.list(filters as Record<string, unknown>),
    queryFn: ({ signal }) => fetchReconciliation(filters, signal),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });
}
