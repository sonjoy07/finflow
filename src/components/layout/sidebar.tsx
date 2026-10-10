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
  ChevronLeft,
  ChevronRight,
  Activity,
  UserCheck,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight, badge: 'Live' },
  { label: 'Reconciliation', href: '/reconciliation', icon: Scale },
  { label: 'Workflows', href: '/workflows', icon: GitBranch },
  { label: 'Activity Logs', href: '/activity', icon: ShieldCheck },
  { label: 'Design System', href: '/design-system', icon: Palette },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      aria-label="Sidebar Navigation"
      className={cn(
        'hidden md:flex flex-col border-r border-border bg-card transition-[width] duration-200 ease-in-out shrink-0 select-none z-30',
        isSidebarCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/40">
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-2.5 font-bold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1',
            isSidebarCollapsed && 'justify-center w-full'
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono font-bold text-xs tracking-tighter shadow-xs shrink-0">
            FF
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight leading-none text-foreground">FinFlow</span>
              <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest mt-0.5">
                PayOps Console
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav role="navigation" className="flex-1 space-y-1.5 p-3 overflow-y-auto">
        {!isSidebarCollapsed && (
          <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Operations Console
          </div>
        )}

        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                isSidebarCollapsed && 'justify-center px-2'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
                aria-hidden="true"
              />
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
              {isActive && isSidebarCollapsed && (
                <span
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary"
                  aria-hidden="true"
                />
              )}
            </Link>
          );

          if (isSidebarCollapsed) {
            return (
              <Tooltip key={item.href} content={item.label} side="right">
                {linkContent}
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* Sidebar Footer / Collapse Trigger */}
      <div className="border-t border-border/40 p-3 flex flex-col gap-2">
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5">
            <div className="flex items-center gap-2.5 truncate">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary shrink-0">
                <UserCheck className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-foreground truncate">Ops Lead</span>
                <span className="text-[10px] text-muted-foreground truncate">admin@finflow.internal</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Tooltip content="Expand sidebar" side="right">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleSidebar}
                aria-label="Expand sidebar"
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    </aside>
  );
}
