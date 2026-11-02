'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Scale,
  GitBranch,
  ShieldCheck,
  Palette,
  Activity,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { usePermission } from '@/features/auth/hooks/use-permission';
import type { Permission } from '@/features/auth/types/auth.types';
import { Drawer } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  permission?: Permission;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight, badge: 'Live', permission: 'TRANSACTION_VIEW' },
  { label: 'Reconciliation', href: '/reconciliation', icon: Scale, permission: 'RECONCILIATION_VIEW' },
  { label: 'Workflows', href: '/workflows', icon: GitBranch, permission: 'WORKFLOW_VIEW' },
  { label: 'Activity Logs', href: '/activity', icon: ShieldCheck, permission: 'ACTIVITY_VIEW' },
  { label: 'Design System', href: '/design-system', icon: Palette },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isMobileNavOpen, setMobileNavOpen } = useUIStore();
  const { can } = usePermission();

  const visibleNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return can(item.permission);
  });

  return (
    <Drawer
      isOpen={isMobileNavOpen}
      onClose={() => setMobileNavOpen(false)}
      side="left"
      title="FinFlow Navigation"
      description="Payment Operations Console"
      className="sm:w-[280px]"
    >
      <nav role="navigation" className="space-y-1.5 py-2">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setMobileNavOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-border/40 pt-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground">Synthetic Simulator</span>
            <span className="text-[10px] text-muted-foreground">Admin Mode Active</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
