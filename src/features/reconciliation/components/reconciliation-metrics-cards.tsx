import * as React from 'react';
import { CheckCircle2, AlertTriangle, ArrowUpDown, ShieldCheck, Scale, Banknote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl border border-border bg-card/60 p-4 animate-pulse" />
        ))}
      </div>
    );
  }

  const activeIssuesCount =
    summary.mismatchedCount +
    summary.duplicateCount +
    summary.missingProviderCount +
    summary.missingInternalCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Match Rate Card */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Settlement Match Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {summary.matchRatePercentage}%
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                ({summary.matchedCount}/{summary.totalRecords})
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Automated clearing parity
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>

      {/* Net Settled Capital */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Net Capital Settled
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {formatCurrency(summary.netSettledTotalCents, 'USD')}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Gross minus banking clearing fees
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Banknote className="h-5 w-5" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>

      {/* Discrepancy Amount Delta */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Discrepancy Variance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400">
                {formatCurrency(summary.discrepancyTotalCents, 'USD')}
              </span>
            </div>
            <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 font-medium">
              {activeIssuesCount} unresolved breaks
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Scale className="h-5 w-5" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>

      {/* Resolution Progress */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Audited Resolutions
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {summary.resolvedCount}
              </span>
              <span className="text-xs text-muted-foreground font-medium">resolved</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Manually cleared by operations
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
