import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWorkflow } from '../api/workflow-api';
import { workflowKeys } from '@/lib/query-keys';
import { useToastStore } from '@/stores/toast-store';
import type { Workflow } from '../types/workflow.types';
import type { ApiError } from '@/lib/api-client';

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: (data: Omit<Workflow, 'id' | 'executionCount' | 'createdAt' | 'updatedAt'>) =>
      createWorkflow(data),
    onSuccess: (newWorkflow: Workflow) => {
      queryClient.invalidateQueries({
        queryKey: workflowKeys.all,
      });

      addToast({
        type: 'success',
        title: 'Workflow Created',
        message: `Automation rule "${newWorkflow.name}" successfully created and active.`,
      });
    },
    onError: (error: ApiError | Error) => {
      addToast({
        type: 'error',
        title: 'Failed to Create Workflow',
        message: error.message || 'An error occurred while saving the automation rule.',
      });
    },
  });
}
