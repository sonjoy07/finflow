import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteWorkflow } from '../api/workflow-api';
import { workflowKeys } from '@/lib/query-keys';
import { useToastStore } from '@/stores/toast-store';
import type { ApiError } from '@/lib/api-client';

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: (id: string) => deleteWorkflow(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({
        queryKey: workflowKeys.all,
      });

      addToast({
        type: 'info',
        title: 'Workflow Deleted',
        message: `Workflow rule ${deletedId} has been removed.`,
      });
    },
    onError: (error: ApiError | Error) => {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error.message || 'Unable to delete workflow.',
      });
    },
  });
}
