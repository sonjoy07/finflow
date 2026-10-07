'use client';

import * as React from 'react';
import {
  Shield,
  Clock,
  User,
  Activity,
  Layers,
  Copy,
  Check,
  Globe,
  FileText,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/formatters';
import type { ActivityLog } from '../types/activity.types';

interface ActivityDetailModalProps {
  activity: ActivityLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityDetailModal({
  activity,
  isOpen,
  onClose,
}: ActivityDetailModalProps) {
  const [isCopied, setIsCopied] = React.useState(false);

  if (!activity) return null;

  const copyMetadata = () => {
    if (activity.metadata) {
      navigator.clipboard.writeText(JSON.stringify(activity.metadata, null, 2));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const getResultBadge = () => {
    switch (activity.result) {
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'flagged':
        return <Badge variant="warning">Flagged</Badge>;
      case 'warning':
        return <Badge variant="warning">Warning</Badge>;
      case 'success':
      default:
        return <Badge variant="success">Success</Badge>;
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Audit Event: ${activity.action.replace(/_/g, ' ')}`}
      description={activity.description}
      className="max-w-xl"
    >
      <div className="space-y-4 text-xs">
        {/* Synthetic Audit Disclaimer Banner */}
        <div
          role="note"
          className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 flex items-center justify-between text-[11px] text-muted-foreground"
        >
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Synthetic Audit Trail Sandbox</span>
          </div>
          <span className="font-mono text-[10px] uppercase text-muted-foreground">
            Simulation Only
          </span>
        </div>

        {/* Header Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              Audit Event Log
            </span>
            <Badge variant="outline" className="font-mono text-[10px] py-0 px-1.5 uppercase">
              {activity.id}
            </Badge>
          </div>
          <div>{getResultBadge()}</div>
        </div>

        {/* Actor & Execution Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/20 p-3.5">
          <div>
            <span className="text-muted-foreground block text-[11px]">Operator / Actor</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-semibold text-foreground">{activity.actorName}</span>
              <Badge variant="outline" className="text-[10px] py-0 px-1 uppercase font-mono">
                {activity.actorRole.replace('_', ' ')}
              </Badge>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground block">
              {activity.actorId}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Execution Timestamp (UTC)</span>
            <span className="font-mono font-medium text-foreground mt-0.5 block">
              {formatDateTime(activity.timestamp)}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Target Entity</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 uppercase font-mono">
                {activity.entityType}
              </Badge>
              <span className="font-mono font-semibold text-foreground">{activity.entityId}</span>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Origin IP Address</span>
            <span className="font-mono text-muted-foreground mt-0.5 block">
              {activity.ipAddress || '127.0.0.1 (Local Simulation)'}
            </span>
          </div>
        </div>

        {/* Structured Metadata Payload */}
        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
          <div className="rounded-lg border border-border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" /> Additional Context & Metadata
              </span>
              <button
                type="button"
                onClick={copyMetadata}
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{isCopied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="rounded bg-muted/60 p-2.5 font-mono text-[11px] text-foreground overflow-x-auto max-h-48 border border-border/40">
              {JSON.stringify(activity.metadata, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-border/40">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
