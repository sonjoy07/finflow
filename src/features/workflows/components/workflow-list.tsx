'use client';

import * as React from 'react';
import {
  Play,
  Edit,
  Trash2,
  Clock,
  Activity,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/formatters';
import { usePermission } from '@/features/auth/hooks/use-permission';
import type { Workflow, WorkflowTriggerType } from '../types/workflow.types';
import { TRIGGER_OPTIONS } from '../types/workflow.types';

interface WorkflowListProps {
  workflows: Workflow[];
  isLoading?: boolean;
  onEdit: (workflow: Workflow) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: 'active' | 'paused') => void;
  onSimulateRun: (id: string) => void;
  onViewExecutions: (workflowId: string) => void;
  simulatingWorkflowId?: string | null;
}

export function WorkflowList({
  workflows,
  isLoading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onSimulateRun,
  onViewExecutions,
  simulatingWorkflowId,
}: WorkflowListProps) {
  const { can } = usePermission();
  const canWrite = can('WORKFLOW_WRITE');
  const canSimulate = can('WORKFLOW_SIMULATE');

  const [search, setSearch] = React.useState('');
  const [triggerFilter, setTriggerFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'paused'>('all');

  const filteredWorkflows = React.useMemo(() => {
    return workflows.filter((w) => {
      // Search match
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = w.name.toLowerCase().includes(q);
        const matchesDesc = w.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      // Trigger match
      if (triggerFilter !== 'all' && w.trigger.eventType !== triggerFilter) {
        return false;
      }

      // Status match
      if (statusFilter !== 'all' && w.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [workflows, search, triggerFilter, statusFilter]);

  const getTriggerBadge = (type: WorkflowTriggerType) => {
    switch (type) {
      case 'transaction_failed':
        return <Badge variant="destructive" className="text-[11px]">Transaction Failed</Badge>;
      case 'reconciliation_mismatch':
        return <Badge variant="warning" className="text-[11px]">Reconciliation Mismatch</Badge>;
      case 'high_risk_transaction':
        return <Badge variant="outline" className="text-[11px] border-amber-500/50 text-amber-500">High-Risk Flag</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px]">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-card border border-border/80 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search automation rules by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
            aria-label="Search workflows"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Trigger Filter */}
          <Select
            value={triggerFilter}
            onChange={(e) => setTriggerFilter(e.target.value)}
            options={[
              { label: 'All Triggers', value: 'all' },
              ...TRIGGER_OPTIONS.map((t) => ({ label: t.label, value: t.value })),
            ]}
            className="text-xs h-9 w-[180px]"
            aria-label="Filter by event trigger"
          />

          {/* Status Pills */}
          <div className="flex items-center rounded-md border border-border p-0.5 bg-muted/40 text-xs">
            {(['all', 'active', 'paused'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse p-6">
              <div className="h-5 w-48 bg-muted rounded mb-2" />
              <div className="h-4 w-96 bg-muted rounded mb-4" />
              <div className="h-8 w-full bg-muted rounded" />
            </Card>
          ))}
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Layers className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">No Automation Rules Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {search || triggerFilter !== 'all' || statusFilter !== 'all'
              ? 'No workflows match the active filter criteria. Try resetting filters.'
              : 'Configure your first automated triage and remediation rule to streamline operations.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredWorkflows.map((workflow) => {
            const isSimulating = simulatingWorkflowId === workflow.id;

            return (
              <Card
                key={workflow.id}
                className={cn(
                  'rounded-2xl transition-all duration-200 border border-border/80 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden',
                  workflow.status !== 'active' && 'opacity-85 bg-card/60'
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base font-bold text-foreground">
                          {workflow.name}
                        </CardTitle>
                        {getTriggerBadge(workflow.trigger.eventType)}
                        <Badge
                          variant={workflow.status === 'active' ? 'success' : 'secondary'}
                          className="capitalize text-[10px]"
                        >
                          {workflow.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground max-w-2xl">
                        {workflow.description || 'No description provided.'}
                      </CardDescription>
                    </div>

                    {/* Status Toggle Switch */}
                    <div className="flex items-center gap-2 self-start shrink-0">
                      <span className="text-xs text-muted-foreground font-medium">
                        {workflow.status === 'active' ? 'Enabled' : 'Disabled'}
                      </span>
                      <Switch
                        checked={workflow.status === 'active'}
                        disabled={!canWrite}
                        onCheckedChange={() => onToggleStatus(workflow.id, workflow.status)}
                        label={canWrite ? `Toggle ${workflow.name} active status` : 'Requires WORKFLOW_WRITE permission'}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Conditions & Actions Logic Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 text-xs font-mono">
                    {/* Conditions (IF) */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-sans font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> If Conditions (AND)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {workflow.conditions.map((cond, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-background border border-border text-[11px]"
                          >
                            <span className="text-muted-foreground">{cond.field}</span>
                            <span className="text-primary font-bold">{cond.operator}</span>
                            <span className="text-foreground font-medium">&ldquo;{String(cond.value)}&rdquo;</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions (THEN) */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-sans font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Then Automated Actions
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {workflow.actions.map((act, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-background border border-border text-[11px]"
                          >
                            <span className="text-emerald-500 font-semibold uppercase">
                              {act.type.replace(/_/g, ' ')}
                            </span>
                            {act.params && Object.keys(act.params).length > 0 && (
                              <span className="text-muted-foreground">
                                ({Object.entries(act.params)
                                  .map(([k, v]) => `${k}:${v}`)
                                  .slice(0, 2)
                                  .join(', ')})
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5 text-primary" />
                        <span className="font-semibold text-foreground">{workflow.executionCount}</span> runs
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Last run: {workflow.lastExecutedAt ? formatRelativeTime(workflow.lastExecutedAt) : 'Never executed'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      {/* Simulate Run Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSimulateRun(workflow.id)}
                        disabled={isSimulating || !canSimulate}
                        title={!canSimulate ? 'Requires WORKFLOW_SIMULATE permission' : undefined}
                        className={cn(
                          'h-8 gap-1.5 text-xs',
                          canSimulate
                            ? 'text-primary hover:text-primary hover:bg-primary/10 border-primary/30'
                            : 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        {isSimulating ? 'Simulating...' : 'Simulate Run'}
                      </Button>

                      {/* View Executions */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewExecutions(workflow.id)}
                        className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Terminal className="h-3.5 w-3.5" /> Executions
                      </Button>

                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(workflow)}
                        disabled={!canWrite}
                        title={!canWrite ? 'Requires WORKFLOW_WRITE permission' : undefined}
                        className={cn(
                          'h-8 w-8 p-0',
                          canWrite
                            ? 'text-muted-foreground hover:text-foreground'
                            : 'opacity-40 cursor-not-allowed'
                        )}
                        aria-label={`Edit ${workflow.name}`}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(workflow.id)}
                        disabled={!canWrite}
                        title={!canWrite ? 'Requires WORKFLOW_WRITE permission' : undefined}
                        className={cn(
                          'h-8 w-8 p-0',
                          canWrite
                            ? 'text-muted-foreground hover:text-destructive'
                            : 'opacity-40 cursor-not-allowed'
                        )}
                        aria-label={`Delete ${workflow.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
