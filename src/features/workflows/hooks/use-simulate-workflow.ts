import { useMutation, useQueryClient } from '@tanstack/react-query';
import { simulateWorkflowRun } from '../api/workflow-api';
import { workflowKeys, dashboardKeys } from '@/lib/query-keys';
import { useToastStore } from '@/stores/toast-store';
import type { WorkflowExecution } from '../types/workflow.types';
import type { ApiError } from '@/lib/api-client';

export interface SimulateWorkflowPayload {
  id: string;
  triggerEntityId?: string;
}

export function useSimulateWorkflow() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({ id, triggerEntityId }: SimulateWorkflowPayload) =>
      simulateWorkflowRun(id, triggerEntityId),
    onSuccess: (execution: WorkflowExecution) => {
      // Invalidate both workflows list and all executions lists
      queryClient.invalidateQueries({
        queryKey: workflowKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
      });

      const isSuccess = execution.status === 'success';
      const isSkipped = execution.status === 'skipped';

      addToast({
        type: isSuccess ? 'success' : isSkipped ? 'warning' : 'error',
        title: `Simulated Run: ${execution.status.toUpperCase()}`,
        message: `Workflow "${execution.workflowName}" executed on ${execution.triggerEntityId} in ${execution.durationMs}ms (${execution.stepLogs.length} steps).`,
      });
    },
    onError: (error: ApiError | Error) => {
      addToast({
        type: 'error',
        title: 'Simulation Failed',
        message: error.message || 'Error occurred while simulating workflow run.',
      });
    },
  });
}
