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
        title="Executive Operations Dashboard"
        description="Real-time multi-rail payment analytics, authorization health, failure diagnosis, and settlement reconciliation."
        badge={
          <Badge variant="success" showDot className="font-mono text-[11px]">
            SYSTEM HEALTHY (96.8%)
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
