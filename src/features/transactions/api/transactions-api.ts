import { apiClient } from '@/lib/api-client';
import type {
  TransactionFilters,
  TransactionListItem,
  TransactionDetail,
  RetryTransactionResponse,
} from '../types/transaction.types';

function buildQueryString(filters: TransactionFilters): string {
  const params = new URLSearchParams();

  if (filters.page) params.set('page', filters.page.toString());
  if (filters.pageSize) params.set('pageSize', filters.pageSize.toString());
  if (filters.q) params.set('q', filters.q);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.paymentMethod && filters.paymentMethod !== 'all') params.set('paymentMethod', filters.paymentMethod);
  if (filters.minAmountCents !== undefined) params.set('minAmountCents', filters.minAmountCents.toString());
  if (filters.maxAmountCents !== undefined) params.set('maxAmountCents', filters.maxAmountCents.toString());
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  return params.toString();
}

export async function fetchTransactions(
  filters: TransactionFilters = {},
  signal?: AbortSignal
): Promise<{ data: TransactionListItem[]; meta: { page: number; pageSize: number; totalItems: number; totalPages: number } }> {
  const qs = buildQueryString(filters);
  const endpoint = `/api/transactions${qs ? `?${qs}` : ''}`;

  // Next.js route handler returns { success: true, data: [...], meta: {...} }
  // apiClient unwraps response.data, but meta is top-level in the envelope, so let's call fetch or apiClient
  const res = await fetch(endpoint, { signal });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch transactions');
  }
  const json = await res.json();
  return {
    data: json.data,
    meta: json.meta || { page: 1, pageSize: 25, totalItems: json.data?.length || 0, totalPages: 1 },
  };
}

export async function fetchTransactionById(
  id: string,
  signal?: AbortSignal
): Promise<TransactionDetail> {
  return apiClient<TransactionDetail>(`/api/transactions/${id}`, { signal });
}

export async function executeTransactionRetry(
  id: string,
  idempotencyKey: string,
  notes?: string
): Promise<RetryTransactionResponse> {
  return apiClient<RetryTransactionResponse>(`/api/transactions/${id}/retry`, {
    method: 'POST',
    headers: {
      'X-Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ notes }),
  });
}
