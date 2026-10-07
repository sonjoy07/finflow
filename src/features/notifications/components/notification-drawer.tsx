'use client';

import * as React from 'react';
import {
  Bell,
  CheckCheck,
  Filter,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '../hooks/use-notifications';
import { NotificationItem } from './notification-item';
import type { NotificationFilter } from '../types/notification.types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [filter, setFilter] = React.useState<NotificationFilter>('all');

  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useNotifications({
    unreadOnly: filter === 'unread',
    severity: filter !== 'all' && filter !== 'unread' ? filter : undefined,
  });

  const markReadMutation = useMarkNotificationAsRead();
  const markAllReadMutation = useMarkAllNotificationsAsRead();

  const unreadCount = React.useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const filterOptions: Array<{ id: NotificationFilter; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'error', label: 'Errors' },
    { id: 'warning', label: 'Warnings' },
    { id: 'success', label: 'Success' },
    { id: 'info', label: 'Info' },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Operational Notifications"
      description="Real-time incident alerts, reconciliation flags, and workflow triggers."
    >
      <div className="space-y-4 text-xs">
        {/* Synthetic Sandbox Notice */}
        <div
          role="note"
          className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 flex items-center justify-between text-[11px] text-muted-foreground"
        >
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Simulation Event Feed</span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono uppercase">
            Synthetic Alerts
          </Badge>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-col gap-2.5 pb-2 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground text-xs">Alert Filter</span>
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                {notifications.length}
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending || unreadCount === 0}
              className="h-7 text-[11px] gap-1.5 font-medium"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Mark all read</span>
            </Button>
          </div>

          {/* Filter Pills */}
          <div
            className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar"
            role="tablist"
            aria-label="Notification severity filters"
          >
            {filterOptions.map((opt) => {
              const isActive = filter === opt.id;
              return (
                <button
                  key={opt.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilter(opt.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors shrink-0 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        {isLoading && (
          <div className="space-y-3 pt-2" aria-label="Loading notifications">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-destructive">
                Failed to load operational notifications.
              </p>
              <p className="text-[11px] text-muted-foreground">
                There was a network or server communication error.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-1.5 text-xs mx-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
              <Bell className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1 max-w-xs">
              <p className="text-sm font-semibold text-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground">
                {filter === 'unread'
                  ? 'All notifications have been read. Systems operational.'
                  : 'No alerts match the selected criteria.'}
              </p>
            </div>
            {filter !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilter('all')}
                className="text-xs text-primary"
              >
                Clear filter
              </Button>
            )}
          </div>
        )}

        {!isLoading && !isError && notifications.length > 0 && (
          <div className="space-y-2.5 pt-1">
            {notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onMarkRead={(id) => markReadMutation.mutate(id)}
                onNavigate={onClose}
              />
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}
