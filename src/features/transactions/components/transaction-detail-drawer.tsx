'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Landmark,
  Copy,
  Check,
  Send,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Layers,
  ArrowUpRight,
  Info,
  Lock,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { usePermission } from '@/features/auth/hooks/use-permission';
import { Drawer } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { useTransactionDetail } from '../hooks/use-transaction-detail';
import { RetryTransactionModal } from './retry-transaction-modal';
import { classifyFailureReason } from '../lib/failure-classification';
import type { TransactionDetail } from '../types/transaction.types';

interface TransactionDetailDrawerProps {
  selectedId: string | null;
  onClose: () => void;
}

export function TransactionDetailDrawer({
  selectedId,
  onClose,
}: TransactionDetailDrawerProps) {
  const { data: transaction, isLoading, isError, refetch } = useTransactionDetail(selectedId);

  const [isCopied, setIsCopied] = React.useState(false);
  const [isRetryModalOpen, setIsRetryModalOpen] = React.useState(false);

  const copyPayload = () => {
    if (transaction?.gatewayResponse) {
      navigator.clipboard.writeText(JSON.stringify(transaction.gatewayResponse, null, 2));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const { can } = usePermission();
  const canRetry = can('TRANSACTION_RETRY');

  const failurePolicy = transaction?.status === 'failed' ? classifyFailureReason(transaction.failureReason) : null;

  const isEligibleForRetry =
    Boolean(transaction) &&
    canRetry &&
    transaction?.status === 'failed' &&
    transaction.retryCount < transaction.maxRetriesAllowed;

  return (
    <>
      <Drawer
        isOpen={Boolean(selectedId)}
        onClose={onClose}
        title={transaction ? `Transaction ${transaction.id}` : 'Transaction Details'}
        description={transaction ? `Order Reference: ${transaction.referenceId}` : 'Loading...'}
      >
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center space-y-2">
            <p className="text-xs text-destructive font-semibold">Failed to load transaction details.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && transaction && (
          <div className="space-y-6 text-xs">
            {/* Synthetic Data Disclaimer Pill */}
            <div
              role="note"
              className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 flex items-center justify-between text-[11px] text-muted-foreground"
            >
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>Synthetic Operations Sandbox</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono uppercase">
                Mock Data
              </Badge>
            </div>

            {/* Header Status Card */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase font-semibold text-[10px]">
                  Gross Amount
                </span>
                <span className="font-mono text-xl font-bold text-foreground">
                  {formatCurrency(transaction.amountCents, transaction.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <span className="text-muted-foreground">Current State</span>
                <div className="flex items-center gap-2">
                  {transaction.status === 'settled' && <Badge variant="success" showDot>Settled</Badge>}
                  {transaction.status === 'failed' && <Badge variant="destructive" showDot>Failed</Badge>}
                  {transaction.status === 'pending' && <Badge variant="warning" showDot>Pending</Badge>}
                  {transaction.status === 'processing' && <Badge variant="warning" showDot>Processing</Badge>}
                  {transaction.status === 'refunded' && <Badge variant="purple" showDot>Refunded</Badge>}
                  {transaction.status === 'disputed' && <Badge variant="destructive" showDot>Disputed</Badge>}
                </div>
              </div>

              {/* Decline Reason if Failed */}
              {transaction.failureReason && (
                <div className="rounded-md bg-rose-500/10 border border-rose-500/20 p-2.5 flex flex-col gap-2 text-rose-600 dark:text-rose-400">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <span className="font-semibold block uppercase text-[10px]">Decline Reason</span>
                      <span className="font-mono text-[11px]">{transaction.failureReason}</span>
                    </div>
                  </div>

                  {failurePolicy && (
                    <div className="pt-2 border-t border-rose-500/20 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-muted-foreground">Network Rule:</span>
                        <Badge variant="outline" className="text-[10px] font-mono border-rose-500/30 text-rose-600 dark:text-rose-400">
                          {failurePolicy.visaCategory}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                        {failurePolicy.rationale}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Cross-Module Operational Links */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                <span className="text-muted-foreground text-[11px]">Settlement Parity:</span>
                <Link
                  href={`/reconciliation?search=${transaction.referenceId}`}
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline font-medium"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Audit in Clearing Ledger</span>
                </Link>
              </div>

              {/* Retry Workflow Section */}
              <div className="pt-2 border-t border-border/40">
                {isEligibleForRetry ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsRetryModalOpen(true)}
                    className="w-full gap-2 font-semibold"
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Simulate Smart Retry ({transaction.retryCount}/{transaction.maxRetriesAllowed})</span>
                  </Button>
                ) : (
                  <div className="rounded-md bg-muted/60 p-2.5 flex items-center justify-between text-muted-foreground text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        {!canRetry && transaction.status === 'failed' && 'Retry action restricted: Operator lacks TRANSACTION_RETRY permission.'}
                        {canRetry && transaction.status === 'settled' && 'Transaction settled. No retry required.'}
                        {canRetry && transaction.status === 'processing' && 'Retry in progress. Awaiting simulated response.'}
                        {canRetry && transaction.status === 'pending' && 'Transaction pending acquiring settlement.'}
                        {canRetry && transaction.status === 'refunded' && 'Transaction refunded. Re-execution disabled.'}
                        {canRetry && transaction.status === 'failed' &&
                          transaction.retryCount >= transaction.maxRetriesAllowed &&
                          'Max retries exhausted (3/3). Manual intervention required.'}
                      </span>
                    </div>
                    {transaction.retryCount > 0 && (
                      <span className="font-mono text-[10px] shrink-0 font-semibold">
                        Attempts: {transaction.retryCount}/{transaction.maxRetriesAllowed}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Provider & Lifecycle Metadata */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Execution Metadata
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground block">Order Reference</span>
                  <span className="font-mono text-foreground">{transaction.referenceId}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Provider / Gateway</span>
                  <span className="font-semibold text-foreground">
                    {transaction.gatewayResponse?.gateway || 'Mock Direct Core'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Created At (UTC)</span>
                  <span className="font-mono text-foreground">{formatDateTime(transaction.createdAt)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Updated At (UTC)</span>
                  <span className="font-mono text-foreground">{formatDateTime(transaction.updatedAt)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Processing Duration</span>
                  <span className="font-mono font-semibold text-foreground">
                    {transaction.processingTimeMs.toLocaleString()} ms
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Gateway Ref ID</span>
                  <span className="font-mono text-muted-foreground text-[11px]">
                    {transaction.gatewayResponse?.gatewayTransactionId || 'N/A (Local Rail)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Customer & Risk Profile
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground block">Name</span>
                  <span className="font-semibold text-foreground">{transaction.customer.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Tier</span>
                  <Badge variant="outline" className="uppercase font-mono text-[10px] mt-0.5">
                    {transaction.customer.tier}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block">Email</span>
                  <span className="font-mono text-muted-foreground">{transaction.customer.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Risk Score</span>
                  <span className="font-mono font-bold text-foreground">
                    {transaction.customer.riskScore} / 100
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Payment Rail Details
              </span>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {transaction.paymentMethod === 'card' ? (
                    <CreditCard className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Landmark className="h-5 w-5" aria-hidden="true" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground uppercase">
                    {transaction.paymentMethodDetails.brand ||
                      transaction.paymentMethodDetails.bankName ||
                      transaction.paymentMethod}
                  </span>
                  <span className="font-mono text-muted-foreground text-[11px]">
                    •••• {transaction.paymentMethodDetails.last4 || transaction.paymentMethodDetails.accountLast4 || '0000'}
                    {transaction.paymentMethodDetails.expiry && ` (Exp: ${transaction.paymentMethodDetails.expiry})`}
                  </span>
                </div>
              </div>
            </div>

            {/* Raw Gateway Payload */}
            {transaction.gatewayResponse && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Raw Gateway Response
                  </span>
                  <button
                    type="button"
                    onClick={copyPayload}
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{isCopied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="rounded-lg bg-muted/60 p-3 font-mono text-[11px] text-foreground overflow-x-auto max-h-48">
                  {JSON.stringify(transaction.gatewayResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* Audit Timeline */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Lifecycle Timeline
              </span>
              <ul className="space-y-3 border-l border-border pl-3 ml-1.5" role="list">
                {transaction.timeline.map((evt) => (
                  <li key={evt.id} className="relative space-y-0.5">
                    <span className="absolute -left-[19px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                    <span className="font-semibold text-foreground block capitalize">
                      {(evt.event || 'EVENT').replace(/_/g, ' ')}
                    </span>
                    <p className="text-muted-foreground text-[11px]">{evt.description}</p>
                    <span className="font-mono text-[10px] text-muted-foreground block">
                      {formatDateTime(evt.timestamp)} • {evt.actor}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Drawer>

      {/* Dedicated Confirmation & Retry Modal */}
      {transaction && (
        <RetryTransactionModal
          isOpen={isRetryModalOpen}
          onClose={() => setIsRetryModalOpen(false)}
          transaction={transaction}
        />
      )}
    </>
  );
}
