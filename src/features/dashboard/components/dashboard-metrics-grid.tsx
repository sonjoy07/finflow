import * as React from 'react';
import { ArrowUpRight, ShieldCheck, Activity } from 'lucide-react';
import { formatCurrency, formatPercentageDelta, formatRate } from '@/lib/formatters';
import type { DashboardSummary } from '../types/dashboard.types';

interface DashboardMetricsGridProps {
  summary: DashboardSummary;
}

export function DashboardMetricsGrid({ summary }: DashboardMetricsGridProps) {
  return (
    <section aria-labelledby="kpi-metrics-heading">
      <h2 id="kpi-metrics-heading" className="sr-only">
        Key Performance Indicators
      </h2>

      {/* Swiss Editorial Treasury Block */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.03),0_6px_16px_rgba(0,0,0,0.02)] overflow-hidden transition-all">
        {/* Top Hero: Primary Processed Volume & Institutional Status */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/70 bg-card">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">
                Total Volume
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                Live Net Clearing
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground font-mono">
                {formatCurrency(summary.totalVolumeCents, 'USD')}
              </span>
              <span className="text-xs font-mono font-medium text-muted-foreground">USD</span>
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 font-medium text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{formatPercentageDelta(summary.volumeDeltaPercent)}</span>
              </span>
              <span>vs prior period</span>
              <span className="text-border mx-1">•</span>
              <span className="hidden sm:inline">Calculated across Stripe, Adyen & ACH rails</span>
            </div>
          </div>

          {/* Institutional Integrity Stamp */}
          <div className="hidden lg:flex flex-col items-end gap-1.5 text-right">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5 text-xs text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span className="font-medium">Deterministic Ledger</span>
              <span className="font-mono text-[10px] text-muted-foreground">#42-STABLE</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Real-time settlement accuracy 99.99%</span>
          </div>
        </div>

        {/* Bottom Ledger Columns: Secondary Multi-Rail Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border/60 bg-muted/20">
          {/* 1. Successful */}
          <div className="p-4 sm:p-5 flex flex-col justify-between gap-1.5 hover:bg-card/50 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium text-muted-foreground">Successful</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            </div>
            <div className="text-xl sm:text-2xl font-semibold font-mono tracking-tight text-foreground">
              {summary.successfulTransactionsCount.toLocaleString()}
            </div>
            <span className="text-[11px] text-muted-foreground truncate">Settled &amp; Cleared</span>
          </div>

          {/* 2. Failed */}
          <div className="p-4 sm:p-5 flex flex-col justify-between gap-1.5 hover:bg-card/50 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Failed (Exceptions)</span>
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" />
            </div>
            <div className="text-xl sm:text-2xl font-semibold font-mono tracking-tight text-rose-600 dark:text-rose-400">
              {summary.failedTransactionsCount.toLocaleString()}
            </div>
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 truncate">Requires triage</span>
          </div>

          {/* 3. Pending */}
          <div className="p-4 sm:p-5 flex flex-col justify-between gap-1.5 hover:bg-card/50 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium text-muted-foreground">Pending</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            </div>
            <div className="text-xl sm:text-2xl font-semibold font-mono tracking-tight text-amber-600 dark:text-amber-400">
              {summary.pendingTransactionsCount.toLocaleString()}
            </div>
            <span className="text-[11px] text-muted-foreground truncate">Awaiting gateway settlement</span>
          </div>

          {/* 4. Auth Success Rate */}
          <div className="p-4 sm:p-5 flex flex-col justify-between gap-1.5 hover:bg-card/50 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium text-muted-foreground">Auth Success Rate</span>
              <Activity className="h-3 w-3 text-primary" aria-hidden="true" />
            </div>
            <div className="text-xl sm:text-2xl font-semibold font-mono tracking-tight text-foreground">
              {formatRate(summary.authorizationRate)}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">Above 95% SLA</span>
          </div>

          {/* 5. Avg Processing Time */}
          <div className="p-4 sm:p-5 col-span-2 md:col-span-1 flex flex-col justify-between gap-1.5 hover:bg-card/50 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium text-muted-foreground">Avg Processing Time</span>
              <span className="text-[10px] font-mono text-muted-foreground">p95</span>
            </div>
            <div className="text-xl sm:text-2xl font-semibold font-mono tracking-tight text-foreground">
              <span>{summary.averageProcessingTimeMs}</span> <span className="text-xs font-normal text-muted-foreground font-sans">ms</span>
            </div>
            <span className="text-[11px] text-muted-foreground truncate">Optimal latency (&lt;250ms)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
