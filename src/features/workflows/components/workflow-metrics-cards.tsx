'use client';

import * as React from 'react';
import { GitBranch, PlayCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { WorkflowMetrics } from '../types/workflow.types';

interface WorkflowMetricsCardsProps {
  metrics: WorkflowMetrics;
  isLoading?: boolean;
}

export function WorkflowMetricsCards({ metrics, isLoading = false }: WorkflowMetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-7 w-20 bg-muted rounded mb-1" />
              <div className="h-3 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" role="region" aria-label="Workflow Automation Metrics">
      {/* 1. Active Rules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Automations
          </CardTitle>
          <GitBranch className="h-4 w-4 text-primary" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {metrics.activeCount} <span className="text-sm font-normal text-muted-foreground">/ {metrics.totalCount} rules</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.pausedCount} paused rules standby
          </p>
        </CardContent>
      </Card>

      {/* 2. Total Executions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Simulated Executions
          </CardTitle>
          <PlayCircle className="h-4 w-4 text-emerald-500" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {metrics.totalExecutions.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total rule triggers evaluated
          </p>
        </CardContent>
      </Card>

      {/* 3. Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Action Success Rate
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {metrics.successRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Clean action step completions
          </p>
        </CardContent>
      </Card>

      {/* 4. Automated Remediations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Auto-Retries Triggered
          </CardTitle>
          <RotateCcw className="h-4 w-4 text-amber-500" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {metrics.automatedRetries.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Transient failures remediated
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
