import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, KeyRound, Lock, UserCheck } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DEMO_USERS } from '@/features/auth/types/auth.types';

export const metadata: Metadata = {
  title: 'Access Restricted | FinFlow',
  description: 'Role-based access boundary: Insufficient permissions for requested route.',
};

interface ForbiddenPageProps {
  searchParams: {
    required?: string;
    role?: string;
    from?: string;
  };
}

export default function ForbiddenPage({ searchParams }: ForbiddenPageProps) {
  const { required, role, from } = searchParams;
  const userRole = role as keyof typeof DEMO_USERS | undefined;
  const roleInfo = userRole && DEMO_USERS[userRole] ? DEMO_USERS[userRole] : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-full max-w-lg rounded-xl border border-destructive/20 bg-card p-8 shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-5">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-destructive/10 text-destructive mb-3">
          <Lock className="h-3.5 w-3.5" />
          <span>HTTP 403 · FORBIDDEN ACCESS BOUNDARY</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Access Restricted
        </h1>

        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Your current operational session lacks the necessary permission to view or manipulate this surface.
        </p>

        <div className="mt-6 rounded-lg border border-border/80 bg-muted/40 p-4 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Target Route</span>
            <span className="font-mono font-medium text-foreground">{from || 'Protected Resource'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Active Role</span>
            <span className="font-mono font-medium text-foreground">
              {roleInfo ? `${roleInfo.title} (${roleInfo.role})` : role || 'Unknown'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Required Permission</span>
            <Badge variant="outline" className="font-mono text-[11px] border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">
              <KeyRound className="h-3 w-3 mr-1" />
              {required || 'RESTRICTED'}
            </Badge>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: 'outline', className: 'gap-2' })}
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Link>
          <Link
            href="/dashboard?openRoleSwitcher=true"
            className={buttonVariants({ variant: 'primary', className: 'gap-2' })}
          >
            <UserCheck className="h-4 w-4" />
            Switch Active Persona
          </Link>
        </div>
      </div>
    </div>
  );
}
