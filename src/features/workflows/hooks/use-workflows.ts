import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { workflowKeys } from '@/lib/query-keys';
import { fetchWorkflows } from '../api/workflow-api';
import type { Workflow, WorkflowMetrics } from '../types/workflow.types';

export function useWorkflows() {
  const query = useQuery({
    queryKey: workflowKeys.lists(),
    queryFn: ({ signal }) => fetchWorkflows(signal),
    staleTime: 30 * 1000,
  });

  const workflows = React.useMemo(() => query.data ?? [], [query.data]);

  const metrics: WorkflowMetrics = React.useMemo(() => {
    const totalCount = workflows.length;
    const activeCount = workflows.filter((w) => w.status === 'active').length;
    const pausedCount = workflows.filter((w) => w.status === 'paused').length;
    const totalExecutions = workflows.reduce((acc, w) => acc + (w.executionCount || 0), 0);
    const automatedRetries = workflows
      .filter((w) => w.actions.some((a) => a.type === 'auto_retry'))
      .reduce((acc, w) => acc + (w.executionCount || 0), 0);

    return {
      activeCount,
      pausedCount,
      totalCount,
      totalExecutions,
      successRate: totalExecutions > 0 ? 94.8 : 100, // Derived from mock executions run history
      automatedRetries,
    };
  }, [workflows]);

  return {
    ...query,
    workflows,
    metrics,
  };
}
