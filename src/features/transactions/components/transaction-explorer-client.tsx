'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import type { VisibilityState, RowSelectionState } from '@tanstack/react-table';
import { useUrlFilters } from '@/hooks/use-url-filters';
import { useTransactions } from '../hooks/use-transactions';
import { fetchTransactionById } from '../api/transactions-api';
import { transactionKeys } from '@/lib/query-keys';
import { TransactionFilterToolbar } from './transaction-filter-toolbar';
import { TransactionTable } from './transaction-table';
import { TransactionTableSkeleton } from './transaction-table-skeleton';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import type { TransactionListItem } from '../types/transaction.types';

// Lazy-load transaction details drawer to keep critical list bundle lightweight
const TransactionDetailDrawer = dynamic(
  () => import('./transaction-detail-drawer').then((mod) => mod.TransactionDetailDrawer),
  { ssr: false }
);

const ALL_COLUMNS = [
  { id: 'id', label: 'Transaction ID' },
  { id: 'customerName', label: 'Customer' },
  { id: 'amountCents', label: 'Amount' },
  { id: 'status', label: 'Status' },
  { id: 'riskScore', label: 'Risk Score' },
  { id: 'createdAt', label: 'Date' },
];

export function TransactionExplorerClient() {
  const queryClient = useQueryClient();
  const { filters, setFilters, resetAllFilters } = useUrlFilters();

  // Convert dollars in URL to cents for backend query
  const queryFilters = React.useMemo(() => {
    return {
      page: filters.page,
      pageSize: filters.pageSize,
      q: filters.q,
      status: filters.status,
      paymentMethod: filters.paymentMethod,
      minAmountCents: filters.minAmount ? Math.round(parseFloat(filters.minAmount) * 100) : undefined,
      maxAmountCents: filters.maxAmount ? Math.round(parseFloat(filters.maxAmount) * 100) : undefined,
      from: filters.from,
      to: filters.to,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
  }, [filters]);

  const { data: response, isLoading, isError, error, refetch } = useTransactions(queryFilters);

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    id: true,
    customerName: true,
    amountCents: true,
    status: true,
    riskScore: true,
    createdAt: true,
  });

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const toggleColumnVisibility = (columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: prev[columnId] === false ? true : false,
    }));
  };

  const handleSortChange = (column: 'createdAt' | 'amountCents' | 'status' | 'customerName') => {
    const isCurrent = filters.sortBy === column;
    const nextOrder = isCurrent && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters({ sortBy: column, sortOrder: nextOrder });
  };

  const handleSelectTransaction = (id: string) => {
    setFilters({ selectedId: id });
  };

  const handlePrefetchTransaction = React.useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: transactionKeys.detail(id),
        queryFn: ({ signal }) => fetchTransactionById(id, signal),
        staleTime: 30 * 1000,
      });
    },
    [queryClient]
  );

  const handleCloseDrawer = () => {
    setFilters({ selectedId: null });
  };

  // Client-side CSV Export
  const handleExportCsv = () => {
    if (!response?.data || response.data.length === 0) return;

    // If rows are selected, export selected; else export all in view
    const selectedIndices = Object.keys(rowSelection).map(Number);
    const rowsToExport: TransactionListItem[] =
      selectedIndices.length > 0
        ? selectedIndices.map((idx) => response.data[idx]).filter((r): r is TransactionListItem => Boolean(r))
        : response.data;

    const headers = ['ID', 'Reference', 'Customer Name', 'Customer Email', 'Amount USD', 'Status', 'Payment Method', 'Date UTC'];
    const rows = rowsToExport.map((t) => [
      t.id,
      t.referenceId,
      `"${t.customer.name}"`,
      t.customer.email,
      (t.amountCents / 100).toFixed(2),
      t.status,
      t.paymentMethod,
      t.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finflow_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <TransactionFilterToolbar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={resetAllFilters}
        columnVisibility={columnVisibility}
        onToggleColumnVisibility={toggleColumnVisibility}
        allColumns={ALL_COLUMNS}
        onExportCsv={handleExportCsv}
      />

      {/* Loading Skeleton */}
      {isLoading && <TransactionTableSkeleton />}

      {/* Error State */}
      {!isLoading && isError && (
        <ErrorState
          title="Failed to fetch transactions"
          message={error?.message || 'An unexpected error occurred while communicating with the transactions service.'}
          onRetry={() => refetch()}
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && response && response.data.length === 0 && (
        <EmptyState
          title="No transactions found"
          description="There are no transaction records matching your active search query or filter parameters."
          actionLabel="Clear All Filters"
          onAction={resetAllFilters}
        />
      )}

      {/* Transaction Table & Pagination */}
      {!isLoading && !isError && response && response.data.length > 0 && (
        <div className="space-y-4">
          <TransactionTable
            data={response.data}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={handleSortChange}
            onSelectTransaction={handleSelectTransaction}
            onPrefetchTransaction={handlePrefetchTransaction}
          />

          <Pagination
            currentPage={response.meta.page}
            totalPages={response.meta.totalPages}
            totalItems={response.meta.totalItems}
            pageSize={response.meta.pageSize}
            onPageChange={(page) => setFilters({ page })}
            onPageSizeChange={(pageSize) => setFilters({ pageSize, page: 1 })}
          />
        </div>
      )}

      {/* Slide-over Transaction Details Drawer */}
      <TransactionDetailDrawer
        selectedId={filters.selectedId}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
