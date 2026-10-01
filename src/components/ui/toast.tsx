'use client';

import * as React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, type Toast } from '@/stores/toast-store';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-50 flex max-h-screen w-full max-w-sm flex-col-reverse gap-2 pointer-events-none p-4"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const isError = toast.type === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-2 duration-200',
        toast.type === 'success' && 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100',
        toast.type === 'error' && 'bg-rose-950/90 border-rose-500/30 text-rose-100',
        toast.type === 'warning' && 'bg-amber-950/90 border-amber-500/30 text-amber-100',
        toast.type === 'info' && 'bg-card border-border text-foreground'
      )}
    >
      <div className="shrink-0 mt-0.5">
        {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />}
        {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-400" aria-hidden="true" />}
        {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />}
        {toast.type === 'info' && <Info className="h-5 w-5 text-primary" aria-hidden="true" />}
      </div>

      <div className="flex-1 space-y-0.5 text-xs">
        <p className="font-semibold">{toast.title}</p>
        {toast.message && <p className="opacity-90 leading-relaxed">{toast.message}</p>}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
