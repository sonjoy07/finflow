'use client';

import * as React from 'react';
import { Menu, Bell, Shield } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from './theme-toggle';
import { Tooltip } from '@/components/ui/tooltip';
import { RoleSwitcher } from '@/features/auth/components/role-switcher';
import { NotificationDrawer } from '@/features/notifications/components/notification-drawer';
import { useNotifications } from '@/features/notifications/hooks/use-notifications';

export function Topbar() {
  const { setMobileNavOpen } = useUIStore();
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = React.useState(false);

  const { data: notifications = [] } = useNotifications();
  const unreadCount = React.useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return (
    <>
      <header
        role="banner"
        className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md sm:px-6"
      >
        <div className="flex items-center gap-3">
          {/* Mobile Menu Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden"
            aria-label="Open mobile navigation"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>

          {/* Environment Badge */}
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 font-mono text-[11px] py-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span>MOCK GATEWAYS ACTIVE</span>
            </Badge>
            <span className="text-xs text-muted-foreground hidden lg:inline">
              Deterministic Seed #42
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Icon Button */}
          <Tooltip
            content={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications (All caught up)'}
            side="bottom"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNotificationDrawerOpen(true)}
              aria-label={`View notifications (${unreadCount} unread)`}
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
              )}
            </Button>
          </Tooltip>

          {/* Theme Toggle */}
          <ThemeToggle />

          <div className="h-5 w-px bg-border/60 mx-1 hidden sm:block" />

          {/* Operator Role Switcher */}
          <div className="pl-1">
            <RoleSwitcher />
          </div>
        </div>
      </header>

      {/* Slide-over Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
      />
    </>
  );
}
