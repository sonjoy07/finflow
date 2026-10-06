'use client';

import * as React from 'react';
import {
  Terminal,
  Clock,
  Cpu,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { formatDate } from '@/lib/formatters';
import type { WorkflowExecution, Workflow } from '../types/workflow.types';

interface ExecutionHistoryTableProps {
  executions: WorkflowExecution[];
  workflows: Workflow[];
  totalItems: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  selectedWorkflowId?: string;
  onWorkflowFilterChange: (workflowId: string) => void;
  selectedStatus?: string;
  onStatusFilterChange: (status: 'all' | 'success' | 'skipped' | 'failed') => void;
  onSelectExecution: (execution: WorkflowExecution) => void;
  isLoading?: boolean;
}

export function ExecutionHistoryTable({
  executions,
  workflows,
  totalItems,
  page,
  pageSize,
  onPageChange,
  selectedWorkflowId = 'all',
  onWorkflowFilterChange,
  selectedStatus = 'all',
  onStatusFilterChange,
  onSelectExecution,
  isLoading = false,
}: ExecutionHistoryTableProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const getStatusBadge = (status: WorkflowExecution['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="success" className="text-[11px]">Success</Badge>;
      case 'skipped':
        return <Badge variant="secondary" className="text-[11px]">Skipped</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-[11px]">Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Simulation Disclaimer Banner */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-foreground flex items-start gap-3">
        <Cpu className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-primary uppercase tracking-wide text-[11px] block">
            Simulated Execution Audit Log
          </span>
          <p className="text-muted-foreground mt-0.5">
            All rule evaluations, auto-retry dispatching, and Slack webhooks operate in FinFlow&apos;s isolated simulation environment. No real banking networks or live communications are triggered.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-card border border-border rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Workflow Filter Dropdown */}
          <Select
            value={selectedWorkflowId}
            onChange={(e) => onWorkflowFilterChange(e.target.value)}
            options={[
              { label: 'All Automation Rules', value: 'all' },
              ...workflows.map((w) => ({ label: w.name, value: w.id })),
            ]}
            className="text-xs h-9 w-[240px]"
            aria-label="Filter executions by workflow"
          />

          {/* Status Pills */}
          <div className="flex items-center rounded-md border border-border p-0.5 bg-muted/40 text-xs">
            {(['all', 'success', 'skipped', 'failed'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onStatusFilterChange(st)}
                className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                  selectedStatus === st
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{executions.length}</span> of {totalItems} executions
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Workflow Executions History">
            <thead className="bg-muted/40 border-b border-border font-medium text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Execution ID</th>
                <th scope="col" className="px-4 py-3 font-semibold">Rule Name</th>
                <th scope="col" className="px-4 py-3 font-semibold">Trigger Entity</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold">Duration</th>
                <th scope="col" className="px-4 py-3 font-semibold">Executed At</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-muted rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-40 bg-muted rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-muted rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-muted rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-12 bg-muted rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-28 bg-muted rounded" /></td>
                    <td className="px-4 py-3 text-right"><div className="h-7 w-20 bg-muted rounded ml-auto" /></td>
                  </tr>
                ))
              ) : executions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Terminal className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                    <p className="font-semibold text-foreground">No Executions Recorded</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      No automated executions have run matching the selected filters.
                    </p>
                  </td>
                </tr>
              ) : (
                executions.map((exec) => (
                  <tr
                    key={exec.id}
                    onClick={() => onSelectExecution(exec)}
                    className="hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-foreground">
                      {exec.id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground max-w-[200px] truncate">
                      {exec.workflowName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {exec.triggerEntityType.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-muted-foreground">{exec.triggerEntityId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(exec.status)}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {exec.durationMs}ms
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {formatDate(exec.executedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectExecution(exec);
                        }}
                        className="h-7 gap-1 text-xs text-primary hover:text-primary hover:bg-primary/10"
                        aria-label={`Inspect logs for ${exec.id}`}
                      >
                        <Eye className="h-3 w-3" /> Logs
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > pageSize && (
          <div className="p-3 border-t border-border">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
