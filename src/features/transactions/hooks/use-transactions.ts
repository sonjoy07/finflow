import { useQuery } from '@tanstack/react-query';
import { transactionKeys } from '../api/transaction-keys';
import { fetchTransactions } from '../api/transactions-api';
import type { TransactionFilters } from '../types/transaction.types';

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: ({ signal }) => fetchTransactions(filters, signal),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });
}
