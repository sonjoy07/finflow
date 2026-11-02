import * as React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  RotateCw,
  ExternalLink,
  Layers,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { formatCurrency, formatRelativeTime } from '@/lib/formatters';
import { classifyFailureReason } from '@/features/transactions/lib/failure-classification';
import type { SeedTransaction } from '@/lib/mock-data/seed-transactions';
import type { DashboardSummary } from '../types/dashboard.types';

interface OperationalExceptionsPanelProps {
  summary: DashboardSummary;
  recentTransactions: SeedTransaction[];
  onSelectTransaction?: (id: string) => void;
}

export function OperationalExceptionsPanel({
  summary,
  recentTransactions,
  onSelectTransaction,
}: OperationalExceptionsPanelProps) {
  // Extract failed transactions for immediate operational triage
  const failedTransactions = React.useMemo(() => {
    return recentTransactions.filter((tx) => tx.status === 'failed').slice(0, 4);
  }, [recentTransactions]);

  const hasDiscrepancy = summary.unreconciledDiscrepancyCents > 0;
  const hasExceptions = failedTransactions.length > 0 || hasDiscrepancy;

  if (!hasExceptions) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">Operational Queue Clear</h3>
            <p className="text-[11px] text-muted-foreground">
              Zero active decline breaks or clearing variances detected across payment rails.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
          100% HEALTHY
        </Badge>
      </div>
    );
  }

  return (
    <section aria-labelledby="operational-exceptions-heading" className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <h3 id="operational-exceptions-heading" className="text-sm font-semibold tracking-tight text-foreground">
            Operational Exceptions Requiring Triage
          </h3>
          <Badge variant="outline" className="text-[10px] font-mono border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10">
            {summary.failedTransactionsCount} Declines · {hasDiscrepancy ? '1 Variance Break' : 'Balanced'}
          </Badge>
        </div>

        <Link
          href="/transactions?status=failed"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
        >
          <span>View all failed records</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Grid of Exceptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Discrepancy Break Banner if variance exists */}
        {hasDiscrepancy && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  Ledger Settlement Variance Break
                </span>
                <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  {formatCurrency(summary.unreconciledDiscrepancyCents, 'USD')}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Clearing partner batch totals differ from internal journal ledger entries. Requires review and audit sign-off.
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-rose-500/20 flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">Gateway: Stripe Direct Batch #8812</span>
              <Link
                href="/reconciliation?status=mismatched"
                className={buttonVariants({
                  variant: 'outline',
                  size: 'sm',
                  className: 'h-7 text-xs border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10',
                })}
              >
                Resolve Break
              </Link>
            </div>
          </div>
        )}

        {/* Failed Transaction Cards with Policy Recommendations */}
        {failedTransactions.map((tx) => {
          const policy = classifyFailureReason(tx.failureReason);
          return (
            <div
              key={tx.id}
              className="rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between shadow-xs hover:border-border transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-foreground">{tx.id}</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10">
                      Failed
                    </Badge>
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                    {formatCurrency(tx.amountCents, tx.currency)}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground mb-2 flex items-center justify-between">
                  <span>Customer: <strong className="text-foreground">{tx.customer.name}</strong></span>
                  <span className="font-mono text-[10px]">{formatRelativeTime(tx.createdAt)}</span>
                </div>

                {/* Decline reason & policy badge */}
                <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] space-y-1 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Decline:</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">{tx.failureReason || 'generic_decline'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Mandate:</span>
                    <span className="text-foreground">{policy.visaCategory}</span>
                  </div>
                </div>
              </div>

              {/* Action footer */}
              <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px]">
                  Attempts: <strong className="font-mono text-foreground">{tx.retryCount}/{tx.maxRetriesAllowed}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {onSelectTransaction ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectTransaction(tx.id)}
                      className="h-7 text-xs gap-1"
                    >
                      <span>Diagnose</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Link
                      href={`/transactions?q=${tx.id}`}
                      className={buttonVariants({ variant: 'outline', size: 'sm', className: 'h-7 text-xs gap-1' })}
                    >
                      <span>Diagnose</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
