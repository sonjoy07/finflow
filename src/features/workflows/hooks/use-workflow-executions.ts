import { useQuery } from '@tanstack/react-query';
import { workflowKeys } from '@/lib/query-keys';
import { fetchWorkflowExecutions } from '../api/workflow-api';

export interface UseWorkflowExecutionsOptions {
  workflowId?: string;
  status?: 'all' | 'success' | 'skipped' | 'failed';
  page?: number;
  pageSize?: number;
}

export function useWorkflowExecutions(options: UseWorkflowExecutionsOptions = {}) {
  const { workflowId, status = 'all', page = 1, pageSize = 25 } = options;

  return useQuery({
    queryKey: workflowKeys.allExecutions({ workflowId, status, page, pageSize }),
    queryFn: ({ signal }) =>
      fetchWorkflowExecutions(
        {
          workflowId: workflowId === 'all' ? undefined : workflowId,
          status,
          page,
          pageSize,
        },
        signal
      ),
    staleTime: 15 * 1000,
    placeholderData: (prev) => prev,
  });
}
