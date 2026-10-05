'use client';

import * as React from 'react';
import { ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';
import { useResolveReconciliation } from '../hooks/use-resolve-reconciliation';
import type { ReconciliationRecord } from '../types/reconciliation.types';

interface ResolveDiscrepancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ReconciliationRecord | null;
  onSuccess?: () => void;
}

export function ResolveDiscrepancyModal({
  isOpen,
  onClose,
  record,
  onSuccess,
}: ResolveDiscrepancyModalProps) {
  const resolveMutation = useResolveReconciliation();

  const [notes, setNotes] = React.useState('Interchange fee confirmed with clearing network. Variance approved.');
  const [action, setAction] = React.useState<'force_match' | 'accept_external' | 'write_off' | 'flag_investigation'>('force_match');
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Synchronous submit lock preventing rapid duplicate submissions
  const isSubmittingRef = React.useRef(false);

  React.useEffect(() => {
    if (isOpen) {
      setNotes('Interchange fee confirmed with clearing network. Variance approved.');
      setAction('force_match');
      setValidationError(null);
      setIsSuccess(false);
      isSubmittingRef.current = false;
    }
  }, [isOpen]);

  if (!record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittingRef.current || resolveMutation.isPending || isSuccess) {
      return;
    }

    if (!notes || notes.trim().length < 5) {
      setValidationError('Audit notes must be at least 5 characters to ensure compliance.');
      return;
    }

    setValidationError(null);
    isSubmittingRef.current = true;

    try {
      await resolveMutation.mutateAsync({
        id: record.id,
        notes: notes.trim(),
        action,
      });

      setIsSuccess(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
      }, 900);
    } catch {
      // Error is captured by resolveMutation.error
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={resolveMutation.isPending ? () => {} : onClose}
      title="Resolve Clearing Discrepancy"
      description="Authorize a simulated ledger reconciliation override for this clearing record."
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
        {/* Synthetic Sandbox Disclaimer */}
        <div
          role="note"
          className="rounded-lg bg-amber-500/10 border border-amber-500/25 p-3 flex items-start gap-2 text-amber-600 dark:text-amber-400"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <span className="font-semibold block uppercase text-[10px]">
              Simulated Ledger Override
            </span>
            <p className="text-[11px] leading-relaxed opacity-90">
              This action will mark the discrepancy as manually resolved in the mock audit log. No real bank accounts or funds will be debited.
            </p>
          </div>
        </div>

        {/* Record Snapshot */}
        <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground uppercase font-semibold text-[10px]">Reconciliation ID</span>
            <span className="font-mono font-semibold text-foreground">{record.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground uppercase font-semibold text-[10px]">Batch Reference</span>
            <span className="font-mono text-foreground">{record.batchId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground uppercase font-semibold text-[10px]">Provider Rail</span>
            <span className="font-medium text-foreground">{record.gatewayName}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <span className="text-muted-foreground uppercase font-semibold text-[10px]">Variance Delta</span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
              +{formatCurrency(record.discrepancyDeltaCents, record.currency)}
            </span>
          </div>
        </div>

        {/* Override Action Type */}
        <div className="space-y-1.5">
          <label htmlFor="resolution-action-select" className="font-medium text-foreground">
            Resolution Protocol
          </label>
          <Select
            id="resolution-action-select"
            value={action}
            onChange={(e) => setAction(e.target.value as any)}
            disabled={resolveMutation.isPending}
            className="text-xs h-9"
          >
            <option value="force_match">Force Match (Accept provider gross with interchange delta)</option>
            <option value="accept_external">Accept Provider Settlement as Source of Truth</option>
            <option value="write_off">Write-off Ledger Variance to Fee Loss Account</option>
            <option value="flag_investigation">Flag for Tier-2 Banking Partner Investigation</option>
          </Select>
        </div>

        {/* Audit Notes */}
        <div className="space-y-1.5">
          <label htmlFor="resolution-notes-input" className="font-medium text-foreground">
            Audit Justification Notes <span className="text-rose-500">*</span>
          </label>
          <Input
            id="resolution-notes-input"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (validationError && e.target.value.trim().length >= 5) {
                setValidationError(null);
              }
            }}
            placeholder="Explain why this discrepancy was cleared..."
            maxLength={500}
            disabled={resolveMutation.isPending}
            className="text-xs"
            aria-invalid={Boolean(validationError)}
          />
          {validationError && (
            <p className="text-rose-600 dark:text-rose-400 text-[11px] font-medium" role="alert">
              {validationError}
            </p>
          )}
        </div>

        {/* Mutation In-Flight / Error / Success States */}
        {resolveMutation.isError && (
          <div
            role="alert"
            className="rounded-lg bg-rose-500/10 border border-rose-500/25 p-3 text-rose-600 dark:text-rose-400 text-xs"
          >
            <span className="font-semibold block uppercase text-[10px]">Resolution Failed</span>
            <p>{resolveMutation.error?.message || 'Failed to submit resolution.'}</p>
          </div>
        )}

        {isSuccess && (
          <div
            role="status"
            className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 p-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Discrepancy resolved successfully! Audit history updated.</span>
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={resolveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={resolveMutation.isPending || isSuccess}
            aria-busy={resolveMutation.isPending}
            className="gap-2 font-semibold"
          >
            {resolveMutation.isPending ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                <span>Applying Override...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                <span>Resolved</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Confirm & Resolve</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
