import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';
import type { DashboardSummary } from '../types/dashboard.types';

interface TriageIncidentSummaryProps {
  summary: DashboardSummary;
}

export function TriageIncidentSummary({ summary }: TriageIncidentSummaryProps) {
  const hasDiscrepancy = summary.unreconciledDiscrepancyCents > 0;
  const hasFailures = summary.failedTransactionsCount > 0;

  return (
    <Card className="rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Operational Exceptions</span>
          </CardTitle>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
            P1 Queue
          </span>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Immediate interventions and gateway rail health checks.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Discrepancy Alert */}
        {hasDiscrepancy && (
          <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                Ledger Variance Break
              </span>
              <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(summary.unreconciledDiscrepancyCents, 'USD')}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Variance detected between clearing partner batch settlement and internal journal ledger.
            </p>
            <div className="pt-1">
              <Link href="/reconciliation?status=mismatched">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] w-full justify-between border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10"
                >
                  <span>Resolve Reconciliation</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Failed Transactions Triage Alert */}
        {hasFailures && (
          <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Decline Triage Queue
              </span>
              <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                {summary.failedTransactionsCount} items
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Transactions requiring rule policy overrides or idempotent retry authorization.
            </p>
            <div className="pt-1">
              <Link href="/transactions?status=failed">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] w-full justify-between border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                >
                  <span>Inspect Declined Payments</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Live Multi-Rail Connectivity Status */}
        <div className="pt-2 border-t border-border/50 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Gateway Rails</span>
            <span className="font-mono text-[10px]">P99 Latency</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                <span className="font-medium text-foreground">Stripe Gateway</span>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">112ms • 99.8%</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                <span className="font-medium text-foreground">Adyen Direct</span>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">148ms • 99.1%</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
                <span className="font-medium text-foreground">FedACH Settlement</span>
              </div>
              <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400">Batch Window</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
