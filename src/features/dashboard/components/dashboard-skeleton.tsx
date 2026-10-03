import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-label="Loading dashboard metrics">
      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-16" />
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </Card>

        <Card className="lg:col-span-3 p-5 space-y-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </Card>
      </div>

      {/* Tables Skeleton */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 p-5 space-y-4">
          <Skeleton className="h-4 w-36" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3 p-5 space-y-4">
          <Skeleton className="h-4 w-36" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
