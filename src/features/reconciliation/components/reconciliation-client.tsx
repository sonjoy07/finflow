'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useReconciliation } from '../hooks/use-reconciliation';
import { ReconciliationMetricsCards } from './reconciliation-metrics-cards';
import { ReconciliationFilterToolbar } from './reconciliation-filter-toolbar';
import { ReconciliationTable } from './reconciliation-table';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import type { ReconciliationRecord, ReconciliationFilters } from '../types/reconciliation.types';

// Lazy-load comparison drawer and manual resolution modal
const DiscrepancyDiffViewer = dynamic(
  () => import('./discrepancy-diff-viewer').then((mod) => mod.DiscrepancyDiffViewer),
  { ssr: false }
);

const ResolveDiscrepancyModal = dynamic(
  () => import('./resolve-discrepancy-modal').then((mod) => mod.ResolveDiscrepancyModal),
  { ssr: false }
);

export function ReconciliationClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse filters from URL search params
  const filters: ReconciliationFilters = React.useMemo(() => {
    return {
      status: searchParams.get('status') || 'all',
      search: searchParams.get('search') || '',
      page: Math.max(1, parseInt(searchParams.get('page') || '1', 10)),
      pageSize: parseInt(searchParams.get('pageSize') || '25', 10),
    };
  }, [searchParams]);

  const selectedRecordId = searchParams.get('selectedId');

  // Push updates to URL
  const setFilters = React.useCallback(
    (updates: Partial<ReconciliationFilters & { selectedId?: string | null }>) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      if ('status' in updates || 'search' in updates) {
        nextParams.set('page', '1');
      }

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || value === 'all') {
          nextParams.delete(key);
        } else {
          nextParams.set(key, String(value));
        }
      });

      const queryString = nextParams.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const resetAllFilters = React.useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const { data: response, isLoading, isError, error, refetch } = useReconciliation(filters);

  const [activeResolveRecord, setActiveResolveRecord] = React.useState<ReconciliationRecord | null>(null);

  const records = React.useMemo(() => response?.data.records || [], [response?.data.records]);
  const summary = response?.data.summary;
  const meta = response?.meta || { page: 1, pageSize: 25, totalItems: 0, totalPages: 1 };

  // Find active selected record for comparison drawer
  const selectedRecord = React.useMemo(() => {
    if (!selectedRecordId) return null;
    return records.find((r) => r.id === selectedRecordId) || null;
  }, [selectedRecordId, records]);

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <ReconciliationMetricsCards summary={summary} isLoading={isLoading} />

      {/* Filter and Search Toolbar */}
      <ReconciliationFilterToolbar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={resetAllFilters}
        summaryCounts={
          summary
            ? {
                total: summary.totalRecords,
                matched: summary.matchedCount,
                mismatchedAmount: summary.mismatchedCount,
                duplicate: summary.duplicateCount,
                missingProvider: summary.missingProviderCount,
                missingInternal: summary.missingInternalCount,
                unmatched: summary.totalRecords - summary.matchedCount - summary.resolvedCount - summary.mismatchedCount - summary.duplicateCount - summary.missingProviderCount - summary.missingInternalCount,
                resolved: summary.resolvedCount,
              }
            : undefined
        }
      />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <ErrorState
          title="Failed to load reconciliation records"
          message={error?.message || 'An error occurred while fetching settlement clearing data.'}
          onRetry={() => refetch()}
        />
      )}

      {/* Main Reconciliation Table */}
      {!isLoading && !isError && (
        <div className="space-y-4">
          <ReconciliationTable
            records={records}
            onSelectRecord={(rec) => setFilters({ selectedId: rec.id })}
            onOpenResolveModal={(rec) => setActiveResolveRecord(rec)}
          />

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              pageSize={meta.pageSize}
              totalItems={meta.totalItems}
              onPageChange={(page) => setFilters({ page })}
              onPageSizeChange={(pageSize) => setFilters({ pageSize, page: 1 })}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          )}
        </div>
      )}

      {/* Side-by-Side Comparison Drawer */}
      <DiscrepancyDiffViewer
        record={selectedRecord}
        onClose={() => setFilters({ selectedId: null })}
        onResolve={(rec) => setActiveResolveRecord(rec)}
      />

      {/* Manual Resolution Modal */}
      <ResolveDiscrepancyModal
        isOpen={Boolean(activeResolveRecord)}
        onClose={() => setActiveResolveRecord(null)}
        record={activeResolveRecord}
        onSuccess={() => {
          // If drawer was showing this record, it will refresh via query invalidation
        }}
      />
    </div>
  );
}
