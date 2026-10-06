import Link from 'next/link';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { ArrowRight, Palette, LayoutDashboard } from 'lucide-react';

export default function HomePage() {
  const currentTimestamp = new Date().toISOString();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-4xl space-y-8 rounded-xl border border-border bg-card p-8 shadow-sm">
        <header className="space-y-2 border-b border-border pb-6">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            FinFlow Platform Foundation & Shell
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-card-foreground">
            FinFlow Operations Automation
          </h1>
          <p className="text-sm text-muted-foreground">
            Portfolio-grade fintech operations platform demonstrating senior-level architecture,
            strict TypeScript, accessible UI, and performance engineering.
          </p>
        </header>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard">
            <Button variant="primary" size="md" className="gap-2">
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              <span>Open Operations Console</span>
              <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
            </Button>
          </Link>
          <Link href="/design-system">
            <Button variant="outline" size="md" className="gap-2">
              <Palette className="h-4 w-4" aria-hidden="true" />
              <span>Explore Design System Primitives</span>
            </Button>
          </Link>
        </div>

        <section aria-labelledby="foundation-status" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-4 space-y-1">
            <span className="text-xs uppercase font-medium text-muted-foreground">Framework</span>
            <p className="text-base font-semibold text-foreground">Next.js App Router</p>
            <p className="text-xs text-muted-foreground">React Server Components</p>
          </div>

          <div className="rounded-lg border border-border bg-background p-4 space-y-1">
            <span className="text-xs uppercase font-medium text-muted-foreground">Type Safety</span>
            <p className="text-base font-semibold text-foreground">TypeScript Strict</p>
            <p className="text-xs text-muted-foreground">noImplicitAny & strictNullChecks</p>
          </div>

          <div className="rounded-lg border border-border bg-background p-4 space-y-1">
            <span className="text-xs uppercase font-medium text-muted-foreground">Styling & Tokens</span>
            <p className="text-base font-semibold text-foreground">Tailwind CSS</p>
            <p className="text-xs text-muted-foreground">HSL Variable Design System</p>
          </div>

          <div className="rounded-lg border border-border bg-background p-4 space-y-1">
            <span className="text-xs uppercase font-medium text-muted-foreground">Sample Minor Units</span>
            <p className="text-base font-semibold font-mono text-foreground">
              {formatCurrency(124508000, 'USD')}
            </p>
            <p className="text-xs text-muted-foreground">64-bit Safe Integer Cents</p>
          </div>

          <div className="rounded-lg border border-border bg-background p-4 space-y-1">
            <span className="text-xs uppercase font-medium text-muted-foreground">Initialized At</span>
            <p className="text-xs font-mono text-foreground">{formatDateTime(currentTimestamp)}</p>
            <p className="text-xs text-muted-foreground">Deterministic ISO Format</p>
          </div>

          <div className="rounded-lg border border-border bg-background p-4 space-y-1">
            <span className="text-xs uppercase font-medium text-muted-foreground">Test Suite</span>
            <p className="text-base font-semibold text-foreground">Vitest + RTL</p>
            <p className="text-xs text-muted-foreground">Behavior-Driven Development</p>
          </div>
        </section>

        <footer className="flex flex-col sm:flex-row items-center justify-between border-t border-border pt-6 gap-4 text-xs text-muted-foreground">
          <p>Phase 2 Design System & Shell Ready</p>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              Dashboard
            </Link>
            <Link
              href="/design-system"
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              Design Tokens
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
