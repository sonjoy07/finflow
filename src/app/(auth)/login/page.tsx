'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  Layers,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { DEMO_USERS, ROLE_DISPLAY_NAMES, type UserRole } from '@/features/auth/types/auth.types';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromParam = searchParams.get('from') || '/dashboard';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = React.useState('admin@finflow.io');
  const [password, setPassword] = React.useState('finflow_demo_2026');
  const [selectedRole, setSelectedRole] = React.useState<UserRole>('admin');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(
    errorParam === 'session_expired'
      ? 'Your session has expired. Please sign in again.'
      : errorParam === 'unauthorized'
      ? 'Please sign in to access this protected area.'
      : null
  );

  const handlePersonaSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(DEMO_USERS[role].email);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          email,
          password,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Login failed. Please verify credentials.');
      }

      router.push(fromParam);
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 mb-4">
          <Layers className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Sign In to FinFlow
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Autonomous Fintech Operations &amp; Ledger Automation Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <Card className="border border-border/80 shadow-xl shadow-black/5">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-bold text-foreground">
              Select Operator Persona
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Choose an enterprise role to test server-enforced authorization policies across the platform.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Error Notification Alert */}
            {errorMessage && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Persona Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(DEMO_USERS) as UserRole[]).map((roleKey) => {
                const persona = DEMO_USERS[roleKey];
                const isSelected = selectedRole === roleKey;

                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handlePersonaSelect(roleKey)}
                    className={`flex flex-col text-left p-3 rounded-lg border transition-all text-xs ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                        : 'border-border/70 hover:border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between mb-1">
                      <span className="font-bold text-foreground">{persona.name}</span>
                      <Badge variant={getBadgeVariant(roleKey)} className="text-[10px] py-0 px-1.5">
                        {ROLE_DISPLAY_NAMES[roleKey]}
                      </Badge>
                    </div>
                    <span className="text-[11px] font-medium text-foreground">{persona.title}</span>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                      {persona.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Credential Form */}
            <form onSubmit={handleLogin} className="space-y-4 pt-4 border-t border-border/60">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-medium text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs h-9"
                    placeholder="operator@finflow.io"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-medium text-foreground">
                    Password
                  </label>
                  <span className="text-[10px] text-muted-foreground">Demo simulation</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 text-xs h-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gap-2 font-semibold h-10 mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as {ROLE_DISPLAY_NAMES[selectedRole]}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-muted/30 border-t border-border/40 p-4 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              <span>
                Protected with HMAC-SHA256 signed HTTP-only cookies and Next.js Edge Middleware. No credentials are stored in localStorage.
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs text-muted-foreground font-mono">Initializing FinFlow Identity...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
