'use client';

import * as React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useResolvedChartColors } from '@/hooks/use-theme-color';
import type { StatusDistributionItem } from '../types/dashboard.types';

interface StatusDistributionChartProps {
  data: StatusDistributionItem[];
}

const STATUS_LABELS: Record<string, string> = {
  settled: 'Settled & Cleared',
  failed: 'Failed / Declined',
  pending: 'In Processing',
  refunded: 'Refunded / Disputed',
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: StatusDistributionItem;
  }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0]?.payload;
    if (!item) return null;
    return (
      <div className="rounded-lg border border-border bg-popover p-2.5 text-xs shadow-md">
        <p className="font-semibold text-foreground capitalize">
          {STATUS_LABELS[item.status] || item.status}
        </p>
        <div className="mt-1 flex items-center justify-between gap-3 text-muted-foreground">
          <span>Count: <strong className="text-foreground">{item.count.toLocaleString()}</strong></span>
          <span>Share: <strong className="text-foreground">{item.percentage}%</strong></span>
        </div>
      </div>
    );
  }
  return null;
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const chartData = React.useMemo(() => {
    return data
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        displayName: STATUS_LABELS[item.status] || item.status,
      }));
  }, [data]);

  const chartColors = useResolvedChartColors();
  const statusColorMap: Record<string, string> = {
    settled: chartColors.emerald,
    failed: chartColors.rose,
    pending: chartColors.amber,
    refunded: chartColors.purple,
  };

  return (
    <Card className="flex flex-col rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-semibold tracking-tight text-foreground">Payment Status Distribution</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">Breakdown of all processed transactions by terminal status.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-5 pt-4">
        <div className="h-[280px] w-full" aria-label="Payment Status Donut Chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="count"
                nameKey="displayName"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.status}`}
                    fill={statusColorMap[entry.status] || chartColors.blue}
                    stroke="hsl(var(--card))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Screen Reader Accessible Table Fallback */}
        <div className="sr-only">
          <table>
            <caption>Payment Status Distribution Table</caption>
            <thead>
              <tr>
                <th scope="col">Status</th>
                <th scope="col">Count</th>
                <th scope="col">Percentage (%)</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((d) => (
                <tr key={d.status}>
                  <td>{d.displayName}</td>
                  <td>{d.count}</td>
                  <td>{d.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
