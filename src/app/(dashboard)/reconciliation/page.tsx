import * as React from 'react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { ReconciliationClient } from '@/features/reconciliation/components/reconciliation-client';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Payment Reconciliation | FinFlow',
  description:
    'Audit clearing partner settlements against internal transaction ledgers, investigate amount discrepancies, and record manual overrides.',
};

export default function ReconciliationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Reconciliation"
        description="Audit clearing partner settlements against internal transaction ledgers, investigate variance breaks, and record manual overrides."
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Reconciliation' },
        ]}
      />

      <React.Suspense
        fallback={
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        }
      >
        <ReconciliationClient />
      </React.Suspense>
    </div>
  );
}
