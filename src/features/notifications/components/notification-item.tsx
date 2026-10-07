'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { NotificationItem as NotificationItemType } from '../types/notification.types';

interface NotificationItemProps {
  notification: NotificationItemType;
  onMarkRead: (id: string) => void;
  onNavigate?: () => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onNavigate,
}: NotificationItemProps) {
  const getSeverityIcon = () => {
    switch (notification.severity) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-rose-500" aria-hidden="true" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-primary" aria-hidden="true" />;
    }
  };

  const getSeverityBorder = () => {
    switch (notification.severity) {
      case 'error':
        return 'border-rose-500/20 bg-rose-500/5';
      case 'warning':
        return 'border-amber-500/20 bg-amber-500/5';
      case 'success':
        return 'border-emerald-500/20 bg-emerald-500/5';
      case 'info':
      default:
        return 'border-border/60 bg-muted/20';
    }
  };

  return (
    <div
      role="article"
      aria-label={`${notification.severity} notification: ${notification.title}`}
      className={cn(
        'group relative flex flex-col gap-2 rounded-lg border p-3.5 transition-all text-xs',
        getSeverityBorder(),
        !notification.read ? 'ring-1 ring-primary/20 shadow-sm' : 'opacity-85'
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="mt-0.5 shrink-0">{getSeverityIcon()}</div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-xs leading-snug">
                {notification.title}
              </span>
              {!notification.read && (
                <span
                  className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse"
                  aria-label="Unread notification"
                />
              )}
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-3">
              {notification.message}
            </p>
          </div>
        </div>

        {/* Mark as Read Action Button */}
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification.id);
            }}
            className="h-6 w-6 shrink-0 opacity-70 group-hover:opacity-100 hover:bg-card"
            title="Mark as read"
            aria-label="Mark notification as read"
          >
            <Check className="h-3 w-3" aria-hidden="true" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t border-border/30 text-[10px] text-muted-foreground">
        <time dateTime={notification.createdAt} className="font-mono">
          {formatDateTime(notification.createdAt)}
        </time>

        {notification.linkUrl && (
          <Link
            href={notification.linkUrl}
            onClick={onNavigate}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <span>Inspect</span>
            <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
