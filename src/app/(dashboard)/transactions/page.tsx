import * as React from 'react';
import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { TransactionExplorerClient } from '@/features/transactions/components/transaction-explorer-client';
import { TransactionTableSkeleton } from '@/features/transactions/components/transaction-table-skeleton';

export const metadata = {
  title: 'Transaction Operations | FinFlow PayOps',
  description: 'Search, filter, inspect, and remediate multi-rail payment transactions in real time.',
};

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Operations"
        description="High-density transaction explorer with multi-rail filtering, real-time decline triage, and idempotent retry simulations."
        badge={
          <Badge variant="default" className="font-mono text-[11px]">
            GATEWAY STREAM ACTIVE
          </Badge>
        }
        breadcrumbs={[
          { label: 'FinFlow', href: '/' },
          { label: 'Operations' },
          { label: 'Transactions' },
        ]}
      />

      <Suspense fallback={<TransactionTableSkeleton />}>
        <TransactionExplorerClient />
      </Suspense>
    </div>
  );
}
