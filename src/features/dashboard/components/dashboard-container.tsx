'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Calendar, RefreshCw } from 'lucide-react';
import { useDashboard } from '../hooks/use-dashboard';
import type { TimeRange } from '../types/dashboard.types';
import { DashboardMetricsGrid } from './dashboard-metrics-grid';
import { RecentTransactionsTable } from './recent-transactions-table';
import { RecentActivityList } from './recent-activity-list';
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
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard(timeRange);

  return (
    <div className="space-y-6">
      {/* Filter Toolbar / Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/60 p-3 rounded-xl border border-border/40 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
          <span className="text-xs font-semibold text-foreground">Time Horizon:</span>
          <div
            role="group"
            aria-label="Filter by time horizon"
            className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5"
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
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            aria-label="Refresh operational metrics"
          >
            <RefreshCw
              className={cn('h-3.5 w-3.5', isFetching && 'animate-spin text-primary')}
              aria-hidden="true"
            />
            <span>Refresh</span>
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
          {/* KPI Metrics */}
          <DashboardMetricsGrid summary={data.summary} />

          {/* Analytics Charts */}
          <div className="grid gap-6 lg:grid-cols-7">
            <div className="lg:col-span-4">
              <VolumeTrendChart data={data.volumeOverTime} />
            </div>
            <div className="lg:col-span-3">
              <StatusDistributionChart data={data.statusDistribution} />
            </div>
          </div>

          {/* Operational Feeds (Recent Transactions & Activity) */}
          <div className="grid gap-6 lg:grid-cols-7">
            <div className="lg:col-span-4">
              <RecentTransactionsTable transactions={data.recentTransactions} />
            </div>
            <div className="lg:col-span-3">
              <RecentActivityList activities={data.recentActivity} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
