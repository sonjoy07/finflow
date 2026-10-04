import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TransactionTableSkeleton() {
  return (
    <Card className="animate-pulse" aria-label="Loading transactions table">
      <CardContent className="p-0">
        <div className="p-4 border-b border-border/40 flex flex-wrap gap-3 justify-between items-center">
          <Skeleton className="h-9 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="p-3 w-10"><Skeleton className="h-4 w-4" /></th>
                <th className="p-3"><Skeleton className="h-4 w-24" /></th>
                <th className="p-3"><Skeleton className="h-4 w-32" /></th>
                <th className="p-3"><Skeleton className="h-4 w-20" /></th>
                <th className="p-3"><Skeleton className="h-4 w-16" /></th>
                <th className="p-3"><Skeleton className="h-4 w-20" /></th>
                <th className="p-3"><Skeleton className="h-4 w-24" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-3"><Skeleton className="h-4 w-4" /></td>
                  <td className="p-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="p-3"><Skeleton className="h-4 w-40" /></td>
                  <td className="p-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="p-3"><Skeleton className="h-4 w-12" /></td>
                  <td className="p-3"><Skeleton className="h-4 w-28" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border/40 flex justify-between items-center">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-64" />
        </div>
      </CardContent>
    </Card>
  );
}
