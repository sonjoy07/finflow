import * as React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  ShieldCheck,
  AlertOctagon,
  Clock,
  ExternalLink,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency, formatPercentageDelta, formatRate } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import type { DashboardSummary } from '../types/dashboard.types';

interface DashboardMetricsGridProps {
  summary: DashboardSummary;
}

export function DashboardMetricsGrid({ summary }: DashboardMetricsGridProps) {
  const isHealthyAuth = summary.authorizationRate >= 95;
  const hasDiscrepancy = summary.unreconciledDiscrepancyCents > 0;

  return (
    <section aria-labelledby="treasury-metrics-heading" className="space-y-4">
      <h2 id="treasury-metrics-heading" className="sr-only">
        Key Financial Performance Indicators
      </h2>

      {/* Primary Financial Volume & Multi-Rail Clearing Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Dominant Primary Metric: Net Settled Volume (7 cols on lg) */}
        <div className="lg:col-span-7 rounded-xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs flex flex-col justify-between relative overflow-hidden">
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-500 to-primary/40" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Total Volume
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Clearing
                </span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">USD Settlement</span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold tracking-tight text-foreground tabular-nums">
                {formatCurrency(summary.totalVolumeCents, 'USD')}
              </span>
            </div>

            <div className="flex items-center gap-2.5 pt-2 text-xs text-muted-foreground flex-wrap">
              <span className="inline-flex items-center gap-0.5 font-medium text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{formatPercentageDelta(summary.volumeDeltaPercent)}</span>
              </span>
              <span>vs prior period</span>
              <span className="text-border">•</span>
              <span className="font-mono text-[11px] text-muted-foreground">
                Settled Multi-Rail Clearing
              </span>
              <span className="text-border">•</span>
              <span className="font-mono text-[11px] text-muted-foreground">
                Synthetic Seed #42
              </span>
            </div>
          </div>

          {/* Quick Macro Breakdown Bar */}
          <div className="mt-6 pt-4 border-t border-border/60 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground text-[11px] block">Successful</span>
              <span className="text-sm font-mono font-semibold text-foreground">
                {summary.successfulTransactionsCount.toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground text-[11px] block">Unreconciled Break</span>
              <span className="text-sm font-mono font-semibold text-rose-600 dark:text-rose-400">
                {formatCurrency(summary.unreconciledDiscrepancyCents, 'USD')}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-muted-foreground text-[11px] block">Audit Integrity</span>
              <span className="text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                Deterministic · Active
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Operational Metrics Area (5 cols on lg) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
          {/* Tile 1: Authorization Rate */}
          <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Auth Success Rate</span>
              <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>

            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-foreground tabular-nums">
                {formatRate(summary.authorizationRate)}
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, summary.authorizationRate))}%` }}
                />
              </div>
            </div>

            <span className="text-[11px] text-muted-foreground">
              {isHealthyAuth ? 'Above 95% target threshold' : 'Below target SLA'}
            </span>
          </div>

          {/* Tile 2: Failed Exceptions */}
          <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Failed (Exceptions)</span>
              <AlertOctagon className="h-4 w-4 text-rose-500" aria-hidden="true" />
            </div>

            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
                {summary.failedTransactionsCount.toLocaleString()}
              </div>
              <span className="text-[11px] font-medium text-rose-600/90 dark:text-rose-400/90 block mt-1">
                Active decline queue
              </span>
            </div>

            <Link
              href="/transactions?status=failed"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium group"
            >
              <span>Review Failures</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Tile 3: Pending In-Flight */}
          <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Pending</span>
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            </div>

            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-foreground tabular-nums">
                {summary.pendingTransactionsCount.toLocaleString()}
              </div>
              <span className="text-[11px] text-muted-foreground block mt-1">
                Batch in-flight
              </span>
            </div>

            <span className="text-[11px] text-muted-foreground font-mono">
              ACH &amp; SEPA clearing
            </span>
          </div>

          {/* Tile 4: Average Processing Time */}
          <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Avg Processing Time</span>
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>

            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-foreground tabular-nums flex items-baseline gap-1">
                <span>{summary.averageProcessingTimeMs}</span>
                <span className="text-xs font-normal text-muted-foreground">ms</span>
              </div>
              <span className="text-[11px] text-muted-foreground block mt-1">
                Network latency
              </span>
            </div>

            <span className="text-[11px] text-muted-foreground">
              99th percentile: 280ms
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
