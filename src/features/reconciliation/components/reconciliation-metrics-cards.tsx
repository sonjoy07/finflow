import * as React from 'react';
import { formatCurrency } from '@/lib/formatters';
import type { ReconciliationSummary } from '../types/reconciliation.types';

interface ReconciliationMetricsCardsProps {
  summary?: ReconciliationSummary;
  isLoading?: boolean;
}

export function ReconciliationMetricsCards({
  summary,
  isLoading = false,
}: ReconciliationMetricsCardsProps) {
  if (isLoading || !summary) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card/60 p-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-28 bg-muted rounded" />
              <div className="h-7 w-36 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeIssuesCount =
    summary.mismatchedCount +
    summary.duplicateCount +
    summary.missingProviderCount +
    summary.missingInternalCount;

  return (
    <div className="rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
        {/* 1. Settlement Match Rate */}
        <div className="p-5 sm:p-6 flex flex-col justify-between gap-1.5 hover:bg-muted/10 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Settlement Match Rate
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold font-mono tracking-tight text-foreground">
              {summary.matchRatePercentage}%
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              ({summary.matchedCount}/{summary.totalRecords})
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Automated clearing parity
          </span>
        </div>

        {/* 2. Net Capital Settled */}
        <div className="p-5 sm:p-6 flex flex-col justify-between gap-1.5 hover:bg-muted/10 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Net Capital Settled
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">USD Net</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold font-mono tracking-tight text-foreground">
              {formatCurrency(summary.netSettledTotalCents, 'USD')}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Gross minus banking clearing fees
          </span>
        </div>

        {/* 3. Discrepancy Variance */}
        <div className="p-5 sm:p-6 flex flex-col justify-between gap-1.5 hover:bg-muted/10 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
              Discrepancy Variance
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
              {activeIssuesCount} breaks
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold font-mono tracking-tight text-rose-600 dark:text-rose-400">
              {formatCurrency(summary.discrepancyTotalCents, 'USD')}
            </span>
          </div>
          <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80 font-medium">
            Requires dual-ledger audit
          </span>
        </div>

        {/* 4. Audited Resolutions */}
        <div className="p-5 sm:p-6 flex flex-col justify-between gap-1.5 hover:bg-muted/10 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Audited Resolutions
            </span>
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Verified
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold font-mono tracking-tight text-foreground">
              {summary.resolvedCount}
            </span>
            <span className="text-xs font-mono text-muted-foreground">reconciled</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Manually cleared by operations
          </span>
        </div>
      </div>
    </div>
  );
}
