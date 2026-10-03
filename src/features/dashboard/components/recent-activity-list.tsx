import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Scale, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/formatters';
import type { SeedActivityLog } from '@/lib/mock-data/seed-activity';

interface RecentActivityListProps {
  activities: SeedActivityLog[];
}

function getActivityIcon(action: string) {
  switch (action) {
    case 'TRANSACTION_RETRY':
      return <Zap className="h-3.5 w-3.5 text-primary" aria-hidden="true" />;
    case 'RECONCILIATION_RESOLVE':
      return <Scale className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />;
    case 'DISCREPANCY_FLAGGED':
      return <AlertTriangle className="h-3.5 w-3.5 text-rose-500" aria-hidden="true" />;
    default:
      return <ShieldCheck className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />;
  }
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">Operational Activity</CardTitle>
          <CardDescription>Audit trail of operator interventions & automated rules.</CardDescription>
        </div>
        <Link href="/activity">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-primary">
            <span>Audit Log</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="flex-1 p-4 pt-1">
        <ul className="space-y-3" role="list" aria-label="System activity timeline">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 p-3 hover:bg-muted/40 transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border shrink-0 mt-0.5">
                {getActivityIcon(activity.action)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {activity.actorName}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 uppercase font-mono">
                    {activity.actorRole.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {activity.description}
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span className="font-mono text-[10px] font-semibold text-primary">
                    {activity.entityId}
                  </span>
                  <span className="font-mono text-[10px]">
                    {formatDateTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
