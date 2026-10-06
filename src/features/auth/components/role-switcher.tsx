'use client';

import * as React from 'react';
import {
  Shield,
  ChevronDown,
  Check,
  User,
  LogOut,
  Lock,
  Sparkles,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '../hooks/use-auth';
import { DEMO_USERS, ROLE_DISPLAY_NAMES, type UserRole } from '../types/auth.types';

export function RoleSwitcher() {
  const { user, switchRole, isSwitchingRole, logout, isLoggingOut } = useAuth();

  const getBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'default' as const;
      case 'operations_lead':
        return 'secondary' as const;
      case 'analyst':
        return 'warning' as const;
      case 'auditor':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isSwitchingRole || isLoggingOut}
          className="flex items-center gap-2 rounded-lg border border-border/80 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Current persona: ${user.name} (${ROLE_DISPLAY_NAMES[user.role]}). Click to switch persona.`}
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-3.5 w-3.5" aria-hidden="true" />
          </div>

          <div className="flex flex-col text-left hidden sm:flex">
            <span className="font-semibold leading-tight text-foreground">{user.name}</span>
            <span className="text-[10px] text-muted-foreground">{user.title}</span>
          </div>

          <Badge
            variant={getBadgeVariant(user.role)}
            className="text-[10px] font-semibold uppercase tracking-wider py-0 px-1.5"
          >
            {ROLE_DISPLAY_NAMES[user.role]}
          </Badge>

          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="right" className="w-80 p-2">
        <div className="px-2 py-1.5 border-b border-border/60 mb-1">
          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-primary" /> Switch Operator Persona
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Simulates role-based authorization gates across the entire application shell and API layer.
          </p>
        </div>

        <div className="space-y-1">
          {(Object.keys(DEMO_USERS) as UserRole[]).map((roleKey) => {
            const persona = DEMO_USERS[roleKey];
            const isActive = user.role === roleKey;

            return (
              <DropdownMenuItem
                key={roleKey}
                onClick={() => !isActive && switchRole(roleKey)}
                className={`flex flex-col items-start gap-1 p-2 rounded-md ${
                  isActive ? 'bg-primary/10 text-foreground font-semibold' : ''
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground">{persona.name}</span>
                    <Badge variant={getBadgeVariant(roleKey)} className="text-[10px] py-0 px-1.5">
                      {ROLE_DISPLAY_NAMES[roleKey]}
                    </Badge>
                  </div>
                  {isActive && (
                    <Check className="h-4 w-4 text-primary shrink-0" aria-label="Active persona" />
                  )}
                </div>
                <p className="text-[11px] font-normal text-muted-foreground leading-normal">
                  {persona.description}
                </p>
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator className="my-1.5" />

        <DropdownMenuItem
          onClick={() => logout()}
          className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive gap-2 font-medium"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
