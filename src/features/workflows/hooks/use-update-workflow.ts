import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateWorkflow } from '../api/workflow-api';
import { workflowKeys } from '@/lib/query-keys';
import { useToastStore } from '@/stores/toast-store';
import type { Workflow } from '../types/workflow.types';
import type { ApiError } from '@/lib/api-client';

export interface UpdateWorkflowPayload {
  id: string;
  data: Partial<Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>>;
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: ({ id, data }: UpdateWorkflowPayload) => updateWorkflow(id, data),
    onSuccess: (updated: Workflow) => {
      queryClient.setQueryData(workflowKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({
        queryKey: workflowKeys.all,
      });

      addToast({
        type: 'success',
        title: 'Workflow Updated',
        message: `Workflow "${updated.name}" updated (Status: ${updated.status}).`,
      });
    },
    onError: (error: ApiError | Error) => {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Unable to update workflow definition.',
      });
    },
  });
}
