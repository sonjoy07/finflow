'use client';

import * as React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useResolvedChartColors } from '@/hooks/use-theme-color';
import type { VolumePoint } from '../types/dashboard.types';

interface VolumeTrendChartProps {
  data: VolumePoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover p-3 text-xs shadow-md">
        <p className="font-semibold text-foreground mb-1">{formatDate(label || '')}</p>
        <div className="space-y-1">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-medium text-foreground">
                {formatCurrency(entry.value, 'USD')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export function VolumeTrendChart({ data }: VolumeTrendChartProps) {
  const chartData = React.useMemo(() => {
    return data.map((point) => ({
      ...point,
      formattedDate: formatDate(point.date),
    }));
  }, [data]);

  const chartColors = useResolvedChartColors();

  return (
    <Card className="flex flex-col rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">Transaction Volume Trend</CardTitle>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">USD Clearing</span>
        </div>
        <CardDescription className="text-xs text-muted-foreground">Daily gross volume distribution across settlement statuses.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-5 pt-4">
        <div className="h-[280px] w-full" aria-label="Transaction Volume Area Chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="settledGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.emerald} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={chartColors.emerald} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.rose} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={chartColors.rose} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                dy={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `$${Math.round(value / 100000)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="settledCents"
                name="Settled Volume"
                stroke={chartColors.emerald}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#settledGradient)"
              />
              <Area
                type="monotone"
                dataKey="failedCents"
                name="Failed Volume"
                stroke={chartColors.rose}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#failedGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Screen Reader Accessible Table Fallback */}
        <div className="sr-only">
          <table>
            <caption>Daily Transaction Volume Trend</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Settled ($)</th>
                <th scope="col">Failed ($)</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((d) => (
                <tr key={d.date}>
                  <td>{d.formattedDate}</td>
                  <td>{formatCurrency(d.settledCents, 'USD')}</td>
                  <td>{formatCurrency(d.failedCents, 'USD')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
