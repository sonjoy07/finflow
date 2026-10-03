import * as React from 'react';
import {
  DollarSign,
  CheckCircle,
  AlertOctagon,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* 1. Total Volume */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">
                Total Volume
              </CardDescription>
              <DollarSign className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl font-bold font-mono tracking-tight text-foreground">
              {formatCurrency(summary.totalVolumeCents, 'USD')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Badge variant="success" className="text-[10px] px-1 py-0 h-4">
                {formatPercentageDelta(summary.volumeDeltaPercent)}
              </Badge>
              <span className="text-muted-foreground">vs prior period</span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Successful Transactions */}
        <Card className="hover:border-emerald-500/40 transition-colors">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">
                Successful
              </CardDescription>
              <CheckCircle className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {summary.successfulTransactionsCount.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <span className="text-[11px] text-muted-foreground">Settled & Cleared</span>
          </CardContent>
        </Card>

        {/* 3. Failed Transactions */}
        <Card className="hover:border-rose-500/40 transition-colors">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">
                Failed (Exceptions)
              </CardDescription>
              <AlertOctagon className="h-4 w-4 text-rose-500" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400">
              {summary.failedTransactionsCount.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <span className="text-[11px] text-rose-500 font-medium">Requires triage</span>
          </CardContent>
        </Card>

        {/* 4. Pending Transactions */}
        <Card className="hover:border-amber-500/40 transition-colors">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">
                Pending
              </CardDescription>
              <Clock className="h-4 w-4 text-amber-500" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
              {summary.pendingTransactionsCount.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <span className="text-[11px] text-muted-foreground">Awaiting gateway settlement</span>
          </CardContent>
        </Card>

        {/* 5. Authorization Success Rate */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">
                Auth Success Rate
              </CardDescription>
              <TrendingUp className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl font-bold font-mono tracking-tight text-foreground">
              {formatRate(summary.authorizationRate)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Above 95% SLA</span>
            </div>
          </CardContent>
        </Card>

        {/* 6. Average Processing Time */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">
                Avg Processing Time
              </CardDescription>
              <Zap className="h-4 w-4 text-amber-400" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl font-bold font-mono tracking-tight text-foreground">
              {summary.averageProcessingTimeMs} <span className="text-xs font-normal text-muted-foreground">ms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <span className="text-[11px] text-muted-foreground">Optimal latency (&lt;250ms)</span>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
