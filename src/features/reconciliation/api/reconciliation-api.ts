import { apiClient } from '@/lib/api-client';
import type {
  ReconciliationFilters,
  ReconciliationRecord,
  ReconciliationSummary,
  ResolveReconciliationParams,
} from '../types/reconciliation.types';

function buildQueryString(filters: ReconciliationFilters): string {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.search && filters.search.trim()) params.set('search', filters.search.trim());
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.pageSize) params.set('pageSize', filters.pageSize.toString());
  return params.toString();
}

export async function fetchReconciliation(
  filters: ReconciliationFilters = {},
  signal?: AbortSignal
): Promise<{
  data: {
    records: ReconciliationRecord[];
    summary: ReconciliationSummary;
  };
  meta: { page: number; pageSize: number; totalItems: number; totalPages: number };
}> {
  const qs = buildQueryString(filters);
  const endpoint = `/api/reconciliation${qs ? `?${qs}` : ''}`;

  const res = await fetch(endpoint, { signal });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch reconciliation records');
  }
  const json = await res.json();
  return {
    data: json.data,
    meta: json.meta || {
      page: filters.page || 1,
      pageSize: filters.pageSize || 25,
      totalItems: json.data?.records?.length || 0,
      totalPages: 1,
    },
  };
}

export async function resolveReconciliationDiscrepancy({
  id,
  notes,
  action = 'force_match',
}: ResolveReconciliationParams): Promise<ReconciliationRecord> {
  return apiClient<ReconciliationRecord>(`/api/reconciliation/${id}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify({ notes, action }),
  });
}
