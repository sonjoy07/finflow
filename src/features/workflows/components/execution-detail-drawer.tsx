'use client';

import * as React from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Terminal,
  Copy,
  Check,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/formatters';
import type { WorkflowExecution } from '../types/workflow.types';

interface ExecutionDetailDrawerProps {
  execution: WorkflowExecution | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExecutionDetailDrawer({
  execution,
  isOpen,
  onClose,
}: ExecutionDetailDrawerProps) {
  const [copied, setCopied] = React.useState(false);

  if (!execution) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(execution, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: WorkflowExecution['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="success" className="text-xs">Success</Badge>;
      case 'skipped':
        return <Badge variant="secondary" className="text-xs">Conditions Not Met (Skipped)</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-xs">Execution Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Workflow Execution Audit Log"
      description={`Execution ID: ${execution.id} • Rule: ${execution.workflowName}`}
      className="max-w-2xl overflow-y-auto"
    >
      <div className="space-y-6 pt-2">
        <div className="flex items-center gap-2">
          {getStatusBadge(execution.status)}
        </div>

        {/* Simulation Disclaimer Banner */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground flex items-start gap-2.5">
          <Cpu className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-primary">Simulated Automation Run</p>
            <p className="text-muted-foreground mt-0.5">
              Evaluated deterministically in FinFlow&apos;s local rules engine. No external gateway charges or production webhooks were altered.
            </p>
          </div>
        </div>

          {/* Execution Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg border border-border/70 bg-card/60 text-xs">
            <div>
              <p className="text-muted-foreground font-medium">Trigger Entity</p>
              <p className="font-mono font-semibold text-foreground mt-0.5">{execution.triggerEntityId}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Entity Type</p>
              <p className="capitalize font-semibold text-foreground mt-0.5">
                {execution.triggerEntityType.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Runtime Duration</p>
              <p className="font-mono font-semibold text-foreground mt-0.5 flex items-center gap-1">
                <Clock className="h-3 w-3 text-primary" /> {execution.durationMs}ms
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Executed At</p>
              <p className="font-mono text-foreground mt-0.5">{formatDate(execution.executedAt)}</p>
            </div>
          </div>

          {/* Step Execution Waterfall */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-primary" /> Step Execution Waterfall ({execution.stepLogs.length} steps)
              </h4>
            </div>

            <div className="space-y-2.5 border-l-2 border-border/80 pl-4 ml-2">
              {execution.stepLogs.map((step) => {
                const isSuccess = step.status === 'success';
                const isSkipped = step.status === 'skipped';

                return (
                  <div
                    key={step.stepNumber}
                    className="relative rounded-lg border border-border/70 bg-card p-3 text-xs shadow-sm space-y-1.5"
                  >
                    {/* Status Dot on left line */}
                    <div
                      className={`absolute -left-[23px] top-3.5 h-3.5 w-3.5 rounded-full border-2 border-background flex items-center justify-center ${
                        isSuccess
                          ? 'bg-emerald-500'
                          : isSkipped
                          ? 'bg-muted-foreground'
                          : 'bg-destructive'
                      }`}
                    />

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-muted-foreground">
                          #{step.stepNumber}
                        </span>
                        <span className="font-semibold text-foreground">{step.stepName}</span>
                      </div>
                      <Badge
                        variant={isSuccess ? 'success' : isSkipped ? 'secondary' : 'destructive'}
                        className="text-[10px] uppercase font-mono"
                      >
                        {step.status}
                      </Badge>
                    </div>

                    <p className="font-mono text-[11px] text-muted-foreground bg-muted/30 p-2 rounded border border-border/40">
                      {step.outputMessage}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Raw JSON Audit Payload */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Raw Audit Payload</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyJson}
                className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy JSON'}
              </Button>
            </div>
            <pre className="max-h-48 overflow-auto rounded-md bg-muted/60 p-3 font-mono text-[11px] text-foreground border border-border">
              {JSON.stringify(execution, null, 2)}
            </pre>
          </div>
        </div>
    </Drawer>
  );
}
