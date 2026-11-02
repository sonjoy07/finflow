import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, CreditCard, Landmark, Wallet } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { SeedTransaction } from '@/lib/mock-data/seed-transactions';

interface RecentTransactionsTableProps {
  transactions: SeedTransaction[];
  onSelectTransaction?: (id: string) => void;
}

function getPaymentMethodIcon(method: string) {
  switch (method) {
    case 'card':
      return <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />;
    case 'bank_transfer':
    case 'ach':
    case 'wire':
      return <Landmark className="h-3.5 w-3.5" aria-hidden="true" />;
    default:
      return <Wallet className="h-3.5 w-3.5" aria-hidden="true" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'settled':
      return <Badge variant="success" showDot>Settled</Badge>;
    case 'failed':
      return <Badge variant="destructive" showDot>Failed</Badge>;
    case 'pending':
      return <Badge variant="warning" showDot>Pending</Badge>;
    case 'refunded':
      return <Badge variant="purple" showDot>Refunded</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function RecentTransactionsTable({
  transactions,
  onSelectTransaction,
}: RecentTransactionsTableProps) {
  return (
    <Card className="flex flex-col rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-5 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">Recent Transactions</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Latest cleared payments across connected gateways.</CardDescription>
        </div>
        <Link href="/transactions">
          <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary font-medium hover:bg-primary/5">
            <span>Ledger View</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <caption className="sr-only">Recent Transactions Table</caption>
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
                <th scope="col" className="px-4 py-2.5">Transaction ID</th>
                <th scope="col" className="px-4 py-2.5">Customer</th>
                <th scope="col" className="px-4 py-2.5 text-right">Amount</th>
                <th scope="col" className="px-4 py-2.5">Status</th>
                <th scope="col" className="px-4 py-2.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-sans">
              {transactions.map((txn) => (
                <tr
                  key={txn.id}
                  onClick={() => onSelectTransaction?.(txn.id)}
                  tabIndex={onSelectTransaction ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (onSelectTransaction && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onSelectTransaction(txn.id);
                    }
                  }}
                  className={cn(
                    'hover:bg-muted/40 transition-colors',
                    onSelectTransaction && 'cursor-pointer focus-visible:outline-none focus-visible:bg-muted/60'
                  )}
                >
                  <td className="px-4 py-3 font-mono font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{getPaymentMethodIcon(txn.paymentMethod)}</span>
                      <span>{txn.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{txn.customer.name}</span>
                      <span className="text-[11px] text-muted-foreground">{txn.customer.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-foreground tabular-nums">
                    {formatCurrency(txn.amountCents, txn.currency)}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(txn.status)}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                    {formatDateTime(txn.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
