'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, GitBranch, Terminal, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowMetricsCards } from './workflow-metrics-cards';
import { WorkflowList } from './workflow-list';
import { ExecutionHistoryTable } from './execution-history-table';
import { useWorkflows } from '../hooks/use-workflows';
import { useWorkflowExecutions } from '../hooks/use-workflow-executions';
import { useCreateWorkflow } from '../hooks/use-create-workflow';
import { useUpdateWorkflow } from '../hooks/use-update-workflow';
import { useDeleteWorkflow } from '../hooks/use-delete-workflow';
import { useSimulateWorkflow } from '../hooks/use-simulate-workflow';
import { usePermission } from '@/features/auth/hooks/use-permission';
import type { Workflow, WorkflowExecution } from '../types/workflow.types';
import type { WorkflowFormValues } from '../schemas/workflow-form-schema';

// Lazy-load heavy authoring modal and inspection drawer
const WorkflowBuilderModal = dynamic(
  () => import('./workflow-builder-modal').then((mod) => mod.WorkflowBuilderModal),
  { ssr: false }
);

const ExecutionDetailDrawer = dynamic(
  () => import('./execution-detail-drawer').then((mod) => mod.ExecutionDetailDrawer),
  { ssr: false }
);

export function WorkflowClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state: 'rules' or 'executions'
  const activeTab = searchParams.get('tab') === 'executions' ? 'executions' : 'rules';
  const workflowIdParam = searchParams.get('workflowId') || 'all';
  const pageParam = Number(searchParams.get('page')) || 1;
  const statusParam = (searchParams.get('status') as 'all' | 'success' | 'skipped' | 'failed') || 'all';

  // Builder Modal State
  const [isBuilderOpen, setIsBuilderOpen] = React.useState(false);
  const [editingWorkflow, setEditingWorkflow] = React.useState<Workflow | null>(null);

  // Execution Drawer State
  const [selectedExecution, setSelectedExecution] = React.useState<WorkflowExecution | null>(null);

  // Queries
  const { workflows, metrics, isLoading: isWorkflowsLoading, refetch: refetchWorkflows } = useWorkflows();
  const {
    data: executionsResponse,
    isLoading: isExecutionsLoading,
    refetch: refetchExecutions,
  } = useWorkflowExecutions({
    workflowId: workflowIdParam,
    status: statusParam,
    page: pageParam,
    pageSize: 20,
  });

  // Mutations
  const createMutation = useCreateWorkflow();
  const updateMutation = useUpdateWorkflow();
  const deleteMutation = useDeleteWorkflow();
  const simulateMutation = useSimulateWorkflow();
  const { can } = usePermission();
  const canWrite = can('WORKFLOW_WRITE');

  const handleTabChange = (tab: 'rules' | 'executions') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    if (tab === 'rules') {
      params.delete('page');
      params.delete('workflowId');
      params.delete('status');
    }
    router.push(`?${params.toString()}`);
  };

  const handleOpenCreateModal = () => {
    setEditingWorkflow(null);
    setIsBuilderOpen(true);
  };

  const handleOpenEditModal = (wf: Workflow) => {
    setEditingWorkflow(wf);
    setIsBuilderOpen(true);
  };

  const handleSaveWorkflow = async (formData: WorkflowFormValues) => {
    if (editingWorkflow) {
      await updateMutation.mutateAsync({
        id: editingWorkflow.id,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsBuilderOpen(false);
    setEditingWorkflow(null);
  };

  const handleToggleStatus = (id: string, currentStatus: 'active' | 'paused') => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    updateMutation.mutate({
      id,
      data: { status: nextStatus },
    });
  };

  const handleDeleteWorkflow = (id: string) => {
    if (window.confirm('Are you sure you want to delete this automation workflow?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSimulateRun = (id: string) => {
    simulateMutation.mutate({ id });
  };

  const handleViewExecutionsForWorkflow = (workflowId: string) => {
    const params = new URLSearchParams();
    params.set('tab', 'executions');
    params.set('workflowId', workflowId);
    router.push(`?${params.toString()}`);
  };

  const handleExecutionsWorkflowFilter = (wfId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('workflowId', wfId);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleExecutionsStatusFilter = (st: 'all' | 'success' | 'skipped' | 'failed') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('status', st);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleExecutionsPageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <WorkflowMetricsCards
        metrics={metrics}
        isLoading={isWorkflowsLoading}
      />

      {/* Tabs & New Workflow Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'rules' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleTabChange('rules')}
            className="gap-2 text-xs"
          >
            <GitBranch className="h-4 w-4" />
            Rules & Configuration ({workflows.length})
          </Button>

          <Button
            variant={activeTab === 'executions' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleTabChange('executions')}
            className="gap-2 text-xs"
          >
            <Terminal className="h-4 w-4" />
            Execution History ({executionsResponse?.meta?.totalItems ?? 0})
          </Button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchWorkflows();
              refetchExecutions();
            }}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            aria-label="Refresh workflows data"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>

          {canWrite && (
            <Button
              size="sm"
              onClick={handleOpenCreateModal}
              className="h-8 gap-1.5 text-xs font-semibold"
            >
              <Plus className="h-4 w-4" /> New Workflow
            </Button>
          )}
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'rules' ? (
        <WorkflowList
          workflows={workflows}
          isLoading={isWorkflowsLoading}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteWorkflow}
          onToggleStatus={handleToggleStatus}
          onSimulateRun={handleSimulateRun}
          onViewExecutions={handleViewExecutionsForWorkflow}
          simulatingWorkflowId={simulateMutation.isPending ? simulateMutation.variables?.id : null}
        />
      ) : (
        <ExecutionHistoryTable
          executions={executionsResponse?.data || []}
          workflows={workflows}
          totalItems={executionsResponse?.meta?.totalItems || 0}
          page={pageParam}
          pageSize={20}
          onPageChange={handleExecutionsPageChange}
          selectedWorkflowId={workflowIdParam}
          onWorkflowFilterChange={handleExecutionsWorkflowFilter}
          selectedStatus={statusParam}
          onStatusFilterChange={handleExecutionsStatusFilter}
          onSelectExecution={(exec) => setSelectedExecution(exec)}
          isLoading={isExecutionsLoading}
        />
      )}

      {/* Workflow Builder Modal */}
      <WorkflowBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setEditingWorkflow(null);
        }}
        onSave={handleSaveWorkflow}
        initialData={editingWorkflow}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      {/* Execution Inspection Drawer */}
      <ExecutionDetailDrawer
        execution={selectedExecution}
        isOpen={!!selectedExecution}
        onClose={() => setSelectedExecution(null)}
      />
    </div>
  );
}
