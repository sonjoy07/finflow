'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
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

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 selection:bg-primary/20 selection:text-primary">
      {/* Editorial Top Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-mono font-bold text-sm tracking-tighter shadow-xs">
            FF
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-foreground">FinFlow</span>
            <span className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase">Operations</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
          <span>PORTAL GATEWAY ONLINE</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="my-auto w-full max-w-lg mx-auto py-8">
        <div className="text-center mb-6 space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Sign In to FinFlow
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Autonomous Multi-Rail Financial Operations &amp; Ledger Automation
          </p>
        </div>

        <Card className="rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.02),0_12px_32px_rgba(0,0,0,0.04)] overflow-hidden">
          <CardHeader className="p-6 pb-4 border-b border-border/60 space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground tracking-tight">
                Operator Identity
              </CardTitle>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Role-Based Sandbox
              </span>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Select a persona to test deterministic server-enforced clearance rules:
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* Error Notification Alert */}
            {errorMessage && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Persona Grid: Clean Swiss Architectural Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(DEMO_USERS) as UserRole[]).map((roleKey) => {
                const persona = DEMO_USERS[roleKey];
                const isSelected = selectedRole === roleKey;

                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handlePersonaSelect(roleKey)}
                    className={`group relative flex flex-col text-left p-3 rounded-xl border transition-all text-xs ${
                      isSelected
                        ? 'border-primary/80 bg-primary/5 shadow-xs'
                        : 'border-border/70 hover:border-border hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between mb-1">
                      <span className="font-semibold text-foreground tracking-tight">{persona.name}</span>
                      {isSelected ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground">
                          {ROLE_DISPLAY_NAMES[roleKey]}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium">{persona.title}</span>
                    <p className="text-[10px] text-muted-foreground/80 mt-1 line-clamp-2 leading-relaxed">
                      {persona.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Credential Form */}
            <form onSubmit={handleLogin} className="space-y-4 pt-3 border-t border-border/50">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Authorized Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" aria-hidden="true" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs h-9 font-mono rounded-lg border-border/80 bg-background/50 focus-visible:ring-1 focus-visible:ring-primary"
                    placeholder="operator@finflow.io"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Access Secret
                  </label>
                  <span className="text-[10px] font-mono text-muted-foreground">Pre-filled Demo</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" aria-hidden="true" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 text-xs h-9 font-mono rounded-lg border-border/80 bg-background/50 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gap-2 font-semibold h-10 mt-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-xs"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    <span>Authorizing Operator...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Console as {ROLE_DISPLAY_NAMES[selectedRole]}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-muted/20 border-t border-border/40 p-4 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
              <span>
                Protected with HMAC-SHA256 signed HTTP-only cookies and Next.js Edge Middleware.
              </span>
            </div>
          </CardFooter>
        </Card>
      </main>

      {/* Institutional Compliance Footer */}
      <footer className="w-full max-w-5xl mx-auto py-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground font-mono">
        <div className="flex items-center gap-3">
          <span>PCI-DSS LEVEL 1 READY</span>
          <span>•</span>
          <span>SOC 2 TYPE II COMPLIANT</span>
          <span>•</span>
          <span>256-BIT TLS ENCRYPTION</span>
        </div>
        <div>
          <span>FINFLOW OPERATIONS © 2026</span>
        </div>
      </footer>
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
