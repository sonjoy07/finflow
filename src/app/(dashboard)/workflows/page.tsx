import * as React from 'react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { WorkflowClient } from '@/features/workflows/components/workflow-client';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Workflow Automation | FinFlow',
  description:
    'Configure rule-based triage automations, smart retry protocols, alert dispatching, and inspect simulated execution audit logs.',
};

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflow Automation"
        description="Configure rule-based event triggers, conditional evaluations, automated remediation actions, and review simulated execution histories."
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Workflows' },
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
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        }
      >
        <WorkflowClient />
      </React.Suspense>
    </div>
  );
}
