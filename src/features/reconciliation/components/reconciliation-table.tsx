'use client';

import * as React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Copy,
  Layers,
  ArrowRight,
  ShieldCheck,
  Split,
  HelpCircle,
  Eye,
  CheckCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import type { ReconciliationRecord, ReconciliationMatchStatus } from '../types/reconciliation.types';
import { cn } from '@/lib/utils';

export function getMatchStatusBadge(status: ReconciliationMatchStatus) {
  switch (status) {
    case 'matched':
      return (
        <Badge variant="success" showDot className="gap-1">
          <span>Matched</span>
        </Badge>
      );
    case 'mismatched_amount':
      return (
        <Badge variant="warning" showDot className="gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400">
          <span>Amount Variance</span>
        </Badge>
      );
    case 'duplicate_record':
      return (
        <Badge variant="purple" showDot className="gap-1">
          <span>Duplicate Ref</span>
        </Badge>
      );
    case 'missing_provider':
    case 'missing_external':
      return (
        <Badge variant="warning" showDot className="gap-1 bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400">
          <span>Missing in Provider</span>
        </Badge>
      );
    case 'missing_internal':
      return (
        <Badge variant="destructive" showDot className="gap-1">
          <span>Missing Internal</span>
        </Badge>
      );
    case 'unmatched':
      return (
        <Badge variant="secondary" showDot className="gap-1">
          <span>Unmatched</span>
        </Badge>
      );
    case 'resolved':
      return (
        <Badge variant="outline" className="gap-1 border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <CheckCheck className="h-3 w-3" aria-hidden="true" />
          <span>Resolved</span>
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

interface ReconciliationTableProps {
  records: ReconciliationRecord[];
  onSelectRecord: (record: ReconciliationRecord) => void;
  onOpenResolveModal: (record: ReconciliationRecord) => void;
}

export function ReconciliationTable({
  records,
  onSelectRecord,
  onOpenResolveModal,
}: ReconciliationTableProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <FileQuestion className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">No reconciliation records found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No clearing records match your current filter parameters or search term.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <caption className="sr-only">
            FinFlow Payment Reconciliation Ledger contrasting internal application ledger transactions with clearing provider settlement batches.
          </caption>
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold">
              <th scope="col" className="px-4 py-3 select-none">
                Reconciliation ID / Batch
              </th>
              <th scope="col" className="px-4 py-3 select-none">
                Internal App Record
              </th>
              <th scope="col" className="px-4 py-3 select-none">
                Clearing Provider Record
              </th>
              <th scope="col" className="px-4 py-3 select-none text-right">
                Internal Amount
              </th>
              <th scope="col" className="px-4 py-3 select-none text-right">
                Provider Gross
              </th>
              <th scope="col" className="px-4 py-3 select-none text-right">
                Variance Delta
              </th>
              <th scope="col" className="px-4 py-3 select-none">
                Match Status
              </th>
              <th scope="col" className="px-4 py-3 select-none text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {records.map((record) => {
              const hasDiscrepancy =
                record.matchStatus !== 'matched' && record.matchStatus !== 'resolved';
              const canResolve =
                record.matchStatus !== 'matched' && record.matchStatus !== 'resolved';

              return (
                <tr
                  key={record.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`View discrepancy details for record ${record.id}`}
                  onClick={() => onSelectRecord(record)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectRecord(record);
                    }
                  }}
                  className="hover:bg-muted/50 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                >
                  {/* ID & Batch */}
                  <td className="px-4 py-3 font-mono">
                    <span className="font-semibold text-foreground block">{record.id}</span>
                    <span className="text-[10px] text-muted-foreground block truncate max-w-[130px]">
                      {record.batchId}
                    </span>
                  </td>

                  {/* Internal Record */}
                  <td className="px-4 py-3 font-mono">
                    {record.internalTransactionId ? (
                      <div>
                        <span className="font-semibold text-primary block">{record.internalTransactionId}</span>
                        <span className="text-[10px] text-muted-foreground">Internal Ledger</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-[11px]">
                        None (Unlinked)
                      </span>
                    )}
                  </td>

                  {/* Provider Record */}
                  <td className="px-4 py-3">
                    <div className="font-mono text-foreground font-semibold">
                      {record.externalGatewayReference}
                    </div>
                    <span className="text-[10px] text-muted-foreground block truncate max-w-[150px]">
                      {record.gatewayName}
                    </span>
                  </td>

                  {/* Internal Amount */}
                  <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">
                    {record.internalAmountCents !== null && record.internalAmountCents !== undefined
                      ? formatCurrency(record.internalAmountCents, record.currency)
                      : '—'}
                  </td>

                  {/* External Provider Amount */}
                  <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">
                    {formatCurrency(record.externalAmountCents, record.currency)}
                  </td>

                  {/* Variance Delta */}
                  <td className="px-4 py-3 text-right font-mono">
                    {record.discrepancyDeltaCents > 0 ? (
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        +{formatCurrency(record.discrepancyDeltaCents, record.currency)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground font-medium">$0.00</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3">
                    {getMatchStatusBadge(record.matchStatus)}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-4 py-3 text-right">
                    <div
                      className="inline-flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectRecord(record)}
                        aria-label={`Compare records for ${record.id}`}
                        className="h-8 px-2 text-xs gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Compare</span>
                      </Button>

                      {canResolve && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenResolveModal(record)}
                          aria-label={`Resolve discrepancy for ${record.id}`}
                          className="h-8 px-2 text-xs border-primary/30 text-primary hover:bg-primary/10 gap-1 font-semibold"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Resolve</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
