'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Calendar, RefreshCw } from 'lucide-react';
import { useDashboard } from '../hooks/use-dashboard';
import type { TimeRange } from '../types/dashboard.types';
import { DashboardMetricsGrid } from './dashboard-metrics-grid';
import { RecentTransactionsTable } from './recent-transactions-table';
import { RecentActivityList } from './recent-activity-list';
import { TriageIncidentSummary } from './triage-incident-summary';
import { OperationalExceptionsPanel } from './operational-exceptions-panel';
import { TransactionDetailDrawer } from '@/features/transactions/components/transaction-detail-drawer';
import { DashboardSkeleton } from './dashboard-skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Lazy-load Recharts visualization bundles to prevent blocking critical Dashboard LCP
const VolumeTrendChart = dynamic(
  () => import('./volume-trend-chart').then((mod) => mod.VolumeTrendChart),
  {
    loading: () => (
      <Card className="flex flex-col p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </Card>
    ),
    ssr: false,
  }
);

const StatusDistributionChart = dynamic(
  () => import('./status-distribution-chart').then((mod) => mod.StatusDistributionChart),
  {
    loading: () => (
      <Card className="flex flex-col p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-60" />
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </Card>
    ),
    ssr: false,
  }
);

const TIME_RANGES: Array<{ label: string; value: TimeRange }> = [
  { label: '24 Hours', value: '24h' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
];

export function DashboardContainer() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>('7d');
  const [selectedTransactionId, setSelectedTransactionId] = React.useState<string | null>(null);
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard(timeRange);

  return (
    <div className="space-y-6">
      {/* Sleek Operational Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-foreground">Multi-Rail Clearing Engine</span>
          <span className="text-muted-foreground text-border">•</span>
          <span className="text-muted-foreground font-mono text-[11px]">Stripe · Adyen · SVB ACH</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div
            role="group"
            aria-label="Filter by time horizon"
            className="inline-flex rounded-lg border border-border/80 bg-muted/40 p-0.5 text-xs"
          >
            {TIME_RANGES.map((range) => {
              const isSelected = timeRange === range.value;
              return (
                <button
                  key={range.value}
                  type="button"
                  onClick={() => setTimeRange(range.value)}
                  aria-pressed={isSelected}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isSelected
                      ? 'bg-card text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {range.label}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-7 text-xs gap-1.5 border-border/80 text-muted-foreground hover:text-foreground"
            aria-label="Refresh operational metrics"
          >
            <RefreshCw
              className={cn('h-3.5 w-3.5', isFetching && 'animate-spin text-primary')}
              aria-hidden="true"
            />
            <span>Sync Rails</span>
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <DashboardSkeleton />}

      {/* Error State */}
      {!isLoading && isError && (
        <ErrorState
          title="Unable to load executive metrics"
          message={error?.message || 'A network error occurred while communicating with the metrics service.'}
          onRetry={() => refetch()}
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && (!data || data.summary.totalVolumeCents === 0) && (
        <EmptyState
          title="No operational data recorded"
          description="There are no transaction records matching the selected time range. Try adjusting your time horizon."
          actionLabel="Switch to 30 Days"
          onAction={() => setTimeRange('30d')}
        />
      )}

      {/* Loaded Dashboard Content */}
      {!isLoading && !isError && data && (
        <div className="space-y-6">
          {/* Primary Treasury & Multi-Rail Summary Bar */}
          <DashboardMetricsGrid summary={data.summary} />

          {/* Operational Exceptions Requiring Urgent Triage */}
          <OperationalExceptionsPanel
            summary={data.summary}
            recentTransactions={data.recentTransactions}
            onSelectTransaction={setSelectedTransactionId}
          />

          {/* Asymmetrical Operations Desk (68% Primary Stage / 32% Triage Rail) */}
          <div className="grid gap-6 lg:grid-cols-12 items-start min-w-0 w-full">
            {/* Primary Stage (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-6 min-w-0 w-full overflow-hidden">
              <VolumeTrendChart data={data.volumeOverTime} />
              <RecentTransactionsTable
                transactions={data.recentTransactions}
                onSelectTransaction={setSelectedTransactionId}
              />
            </div>

            {/* Triage Command Rail (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6 min-w-0 w-full overflow-hidden">
              <StatusDistributionChart data={data.statusDistribution} />
              <TriageIncidentSummary summary={data.summary} />
              <RecentActivityList activities={data.recentActivity} />
            </div>
          </div>

          {/* Interactive Transaction Detail Drawer */}
          <TransactionDetailDrawer
            selectedId={selectedTransactionId}
            onClose={() => setSelectedTransactionId(null)}
          />
        </div>
      )}
    </div>
  );
}
