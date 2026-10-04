import { useQuery } from '@tanstack/react-query';
import { transactionKeys } from '../api/transaction-keys';
import { fetchTransactionById } from '../api/transactions-api';

export function useTransactionDetail(id: string | null) {
  return useQuery({
    queryKey: transactionKeys.detail(id || ''),
    queryFn: ({ signal }) => {
      if (!id) throw new Error('Transaction ID is required');
      return fetchTransactionById(id, signal);
    },
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}
