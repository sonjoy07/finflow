import * as React from 'react';
import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { ActivityLogTable } from '@/features/activity/components/activity-log-table';

export const metadata: Metadata = {
  title: 'Activity Logs | FinFlow',
  description: 'Auditable system activity, operator retries, and automated workflow triggers.',
};

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Operational Activity & Audit Trail</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Immutable log of operator mutations, automated workflow decisions, and settlement exceptions.
          </p>
        </div>
      </div>

      {/* Main Table Interface */}
      <ActivityLogTable />
    </div>
  );
}
