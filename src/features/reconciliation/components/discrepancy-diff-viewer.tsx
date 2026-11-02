'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Layers,
  Building,
  Server,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { usePermission } from '@/features/auth/hooks/use-permission';
import { Drawer } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { getMatchStatusBadge } from './reconciliation-table';
import type { ReconciliationRecord } from '../types/reconciliation.types';

interface DiscrepancyDiffViewerProps {
  record: ReconciliationRecord | null;
  onClose: () => void;
  onResolve: (record: ReconciliationRecord) => void;
}

export function DiscrepancyDiffViewer({
  record,
  onClose,
  onResolve,
}: DiscrepancyDiffViewerProps) {
  const { can } = usePermission();
  const canResolve = can('RECONCILIATION_RESOLVE');
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  if (!record) {
    return (
      <Drawer isOpen={false} onClose={onClose} title="Record Comparison">
        <div />
      </Drawer>
    );
  }

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isUnresolved = record.matchStatus !== 'matched' && record.matchStatus !== 'resolved';
  const hasAmountMismatch =
    record.internalAmountCents !== null &&
    record.internalAmountCents !== undefined &&
    record.internalAmountCents !== record.externalAmountCents;

  return (
    <Drawer
      isOpen={Boolean(record)}
      onClose={onClose}
      title={`Reconciliation ${record.id}`}
      description={`Batch Clearing Window: ${record.batchId}`}
    >
      <div className="space-y-6 text-xs">
        {/* Synthetic Sandbox Notice */}
        <div
          role="note"
          className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 flex items-center justify-between text-[11px] text-muted-foreground"
        >
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Synthetic Bank Reconciliation Sandbox</span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono uppercase">
            Simulated Ledger
          </Badge>
        </div>

        {/* Top Status & Variance Overview */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground uppercase font-semibold text-[10px]">
              Match State
            </span>
            <div>{getMatchStatusBadge(record.matchStatus)}</div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <span className="text-muted-foreground">Variance Delta</span>
            <span className="font-mono text-base font-bold text-foreground">
              {record.discrepancyDeltaCents > 0 ? (
                <span className="text-rose-600 dark:text-rose-400">
                  +{formatCurrency(record.discrepancyDeltaCents, record.currency)}
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">$0.00 (Balanced)</span>
              )}
            </span>
          </div>

          {/* Action Button if Unresolved */}
          {isUnresolved && (
            <div className="pt-2 border-t border-border/40">
              {canResolve ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onResolve(record)}
                  className="w-full gap-2 font-semibold"
                >
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Simulate Manual Reconciliation</span>
                </Button>
              ) : (
                <div className="rounded-md bg-muted/60 p-2.5 flex items-center gap-2 text-muted-foreground text-[11px]">
                  <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>Manual resolution restricted: Operator lacks RECONCILIATION_RESOLVE permission.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Root Cause / Mismatch Explanation */}
        {record.mismatchReason && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1 text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wide">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" aria-hidden="true" />
              <span>Discrepancy Root Cause Analysis</span>
            </div>
            <p className="text-xs leading-relaxed opacity-95">
              {record.mismatchReason}
            </p>
          </div>
        )}

        {/* Side-by-Side Record Comparison Grid */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
            Side-by-Side Record Verification
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Left Column: Internal Application Ledger */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Server className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Internal Ledger</h4>
                  <span className="text-[10px] text-muted-foreground">FinFlow Core DB</span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Transaction ID</span>
                  <div className="flex items-center justify-between font-mono font-medium text-foreground">
                    <span>{record.internalTransactionId || 'None (Missing)'}</span>
                    {record.internalTransactionId && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(record.internalTransactionId!, 'internalId')}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Copy internal transaction ID"
                      >
                        {copiedField === 'internalId' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                  {record.internalTransactionId && (
                    <Link
                      href={`/transactions?q=${record.internalTransactionId}`}
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-sans mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Inspect in Core Transactions</span>
                    </Link>
                  )}
                </div>

                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Recorded Gross Amount</span>
                  <div className={`font-mono text-sm font-bold ${hasAmountMismatch ? 'text-amber-500' : 'text-foreground'}`}>
                    {record.internalAmountCents !== null && record.internalAmountCents !== undefined
                      ? formatCurrency(record.internalAmountCents, record.currency)
                      : 'None ($0.00)'}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Currency</span>
                  <span className="font-mono font-semibold text-foreground">{record.currency}</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Status in System</span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {record.internalTransactionId ? 'settled' : 'unrecorded'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right Column: Clearing Provider Settlement */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                  <Building className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Provider Settlement</h4>
                  <span className="text-[10px] text-muted-foreground truncate block max-w-[150px]">
                    {record.gatewayName}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">External Reference</span>
                  <div className="flex items-center justify-between font-mono font-medium text-foreground">
                    <span className="truncate max-w-[140px]">{record.externalGatewayReference}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(record.externalGatewayReference, 'externalRef')}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Copy external reference"
                    >
                      {copiedField === 'externalRef' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Settlement Gross Amount</span>
                  <div className={`font-mono text-sm font-bold ${hasAmountMismatch ? 'text-amber-500' : 'text-foreground'}`}>
                    {formatCurrency(record.externalAmountCents, record.currency)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Interchange Fee</span>
                    <span className="font-mono text-muted-foreground">
                      -{formatCurrency(record.feeDeductedCents, record.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Net Settled</span>
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(record.netSettledCents, record.currency)}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Settlement Window</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {formatDateTime(record.settledAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Resolution Audit Notes (If Resolved) */}
        {record.matchStatus === 'resolved' && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Manual Resolution Audit Record</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Audited By:</span>
                <span className="font-medium text-foreground">{record.resolvedBy || 'Operations Lead'}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Resolution Time:</span>
                <span className="font-mono text-foreground">{record.resolvedAt ? formatDateTime(record.resolvedAt) : 'N/A'}</span>
              </div>
              <div className="pt-1.5 border-t border-border/40">
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Operator Notes</span>
                <p className="italic text-foreground mt-0.5 leading-relaxed bg-card p-2 rounded border border-border/50">
                  &ldquo;{record.resolutionNotes || 'No notes provided.'}&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reconciliation History Timeline */}
        {record.history && record.history.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
              Reconciliation Audit Trail
            </span>
            <ul className="space-y-3 border-l border-border pl-3 ml-1.5" role="list">
              {record.history.map((evt, idx) => (
                <li key={idx} className="relative space-y-0.5">
                  <span className="absolute -left-[19px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground block capitalize">
                      {evt.action.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {formatDateTime(evt.timestamp)}
                    </span>
                  </div>
                  {evt.notes && <p className="text-muted-foreground text-[11px]">{evt.notes}</p>}
                  <span className="font-mono text-[10px] text-muted-foreground block">
                    Actor: {evt.actor}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Drawer>
  );
}
