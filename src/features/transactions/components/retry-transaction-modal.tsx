'use client';

import * as React from 'react';
import { Send, AlertTriangle, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';
import { useRetryTransaction } from '../hooks/use-retry-transaction';
import type { TransactionDetail } from '../types/transaction.types';

interface RetryTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionDetail;
  onSuccess?: () => void;
}

export function RetryTransactionModal({
  isOpen,
  onClose,
  transaction,
  onSuccess,
}: RetryTransactionModalProps) {
  const retryMutation = useRetryTransaction();

  const [idempotencyKey, setIdempotencyKey] = React.useState('');
  const [operatorNotes, setOperatorNotes] = React.useState(
    'Manual triage retry approved by operations lead.'
  );
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Synchronous submit lock preventing double-clicks before React re-render
  const isSubmittingRef = React.useRef(false);

  // Regenerate fresh idempotency key when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIdempotencyKey(`idem_${transaction.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
      setOperatorNotes('Manual triage retry approved by operations lead.');
      setIsSuccess(false);
      isSubmittingRef.current = false;
    }
  }, [isOpen, transaction.id]);

  const handleExecuteRetry = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Guard: duplicate click prevention while pending or submitting
    if (isSubmittingRef.current || retryMutation.isPending || isSuccess) {
      return;
    }

    isSubmittingRef.current = true;

    try {
      await retryMutation.mutateAsync({
        id: transaction.id,
        idempotencyKey,
        notes: operatorNotes,
      });

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after brief confirmation
      setTimeout(() => {
        onClose();
      }, 900);
    } catch {
      // Error is captured by retryMutation.error and displayed inline
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleRegenerateKey = () => {
    setIdempotencyKey(`idem_${transaction.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={retryMutation.isPending ? () => {} : onClose}
      title="Simulate Transaction Retry"
      description="Schedule an immediate idempotent retry through the mock acquiring network."
    >
      <form onSubmit={handleExecuteRetry} className="space-y-4 py-2 text-xs">
        {/* Synthetic Sandbox Disclaimer Banner */}
        <div
          role="note"
          className="rounded-lg bg-amber-500/10 border border-amber-500/25 p-3 flex items-start gap-2.5 text-amber-600 dark:text-amber-400"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <span className="font-semibold block uppercase text-[10px] tracking-wide">
              Simulated Financial Environment
            </span>
            <p className="text-[11px] leading-relaxed opacity-90">
              This triggers a sandbox mock replay. No real credit lines, bank accounts, or financial rails will be debited.
            </p>
          </div>
        </div>

        {/* Transaction Summary Snapshot */}
        <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground uppercase font-semibold text-[10px]">Target Record</span>
            <span className="font-mono font-semibold text-foreground">{transaction.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground uppercase font-semibold text-[10px]">Customer</span>
            <span className="font-semibold text-foreground">{transaction.customer.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground uppercase font-semibold text-[10px]">Gross Amount</span>
            <span className="font-mono font-bold text-foreground">
              {formatCurrency(transaction.amountCents, transaction.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <span className="text-muted-foreground uppercase font-semibold text-[10px]">Attempt Progress</span>
            <Badge variant="outline" className="font-mono text-[10px]">
              Attempt {transaction.retryCount + 1} of {transaction.maxRetriesAllowed}
            </Badge>
          </div>
        </div>

        {/* Generated Idempotency Key */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="idempotency-key-input" className="font-medium text-foreground">
              X-Idempotency-Key
            </label>
            <button
              type="button"
              onClick={handleRegenerateKey}
              disabled={retryMutation.isPending}
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline disabled:opacity-50"
            >
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
              <span>Regenerate</span>
            </button>
          </div>
          <Input
            id="idempotency-key-input"
            readOnly
            value={idempotencyKey}
            className="font-mono text-xs bg-muted/60"
            aria-label="Generated idempotency key"
          />
          <p className="text-[10px] text-muted-foreground">
            Protects against double processing during transient gateway network dropouts.
          </p>
        </div>

        {/* Operator Audit Notes */}
        <div className="space-y-1.5">
          <label htmlFor="operator-notes-input" className="font-medium text-foreground">
            Operator Audit Justification
          </label>
          <Input
            id="operator-notes-input"
            value={operatorNotes}
            onChange={(e) => setOperatorNotes(e.target.value)}
            placeholder="Reason for manual retry authorization..."
            maxLength={500}
            disabled={retryMutation.isPending}
            className="text-xs"
          />
        </div>

        {/* Mutation In-Flight / Success / Error Feedback */}
        {retryMutation.isError && (
          <div
            role="alert"
            className="rounded-lg bg-rose-500/10 border border-rose-500/25 p-3 text-rose-600 dark:text-rose-400 space-y-1"
          >
            <span className="font-semibold block uppercase text-[10px]">Retry Request Rejected</span>
            <p className="text-[11px] leading-relaxed">
              {retryMutation.error?.message || 'The mock acquiring network declined the retry request.'}
            </p>
          </div>
        )}

        {isSuccess && (
          <div
            role="status"
            className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 p-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="font-semibold text-xs">
              Retry payload accepted! Transaction transitioned to processing.
            </span>
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={retryMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={retryMutation.isPending || !idempotencyKey || isSuccess}
            aria-busy={retryMutation.isPending}
            className="gap-2 font-semibold"
          >
            {retryMutation.isPending ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                <span>Simulating Retry...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                <span>Success</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Confirm & Dispatch Retry</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
