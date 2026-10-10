import * as React from 'react';
import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { DashboardContainer } from '@/features/dashboard/components/dashboard-container';
import { DashboardSkeleton } from '@/features/dashboard/components/dashboard-skeleton';

export const metadata = {
  title: 'Executive Dashboard | FinFlow PayOps',
  description: 'Real-time payment volume, authorization success rates, failure metrics, and settlement tracking.',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Static Server Component Header */}
      <PageHeader
        title="Operations Command Center"
        description="Real-time multi-rail payment analytics, authorization health, failure diagnosis, and settlement reconciliation."
        badge={
          <Badge variant="outline" className="font-mono text-[11px] gap-1.5 py-0.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span>SETTLEMENT HEALTHY (96.8%)</span>
          </Badge>
        }
        breadcrumbs={[
          { label: 'FinFlow', href: '/' },
          { label: 'Operations' },
          { label: 'Dashboard' },
        ]}
      />

      {/* Interactive Client Component Tree with Suspense fallback */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContainer />
      </Suspense>
    </div>
  );
}
