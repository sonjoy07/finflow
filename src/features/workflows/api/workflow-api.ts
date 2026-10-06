import { apiClient } from '@/lib/api-client';
import type {
  Workflow,
  WorkflowExecution,
} from '../types/workflow.types';
import type { ApiSuccessResponse } from '@/types';

export interface WorkflowExecutionsResponse {
  data: WorkflowExecution[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export async function fetchWorkflows(signal?: AbortSignal): Promise<Workflow[]> {
  const res = await apiClient<ApiSuccessResponse<Workflow[]>>('/api/workflows', {
    method: 'GET',
    signal,
  });
  return res.data;
}

export async function fetchWorkflowById(id: string, signal?: AbortSignal): Promise<Workflow> {
  const res = await apiClient<ApiSuccessResponse<Workflow>>(`/api/workflows/${encodeURIComponent(id)}`, {
    method: 'GET',
    signal,
  });
  return res.data;
}

export async function createWorkflow(
  data: Omit<Workflow, 'id' | 'executionCount' | 'createdAt' | 'updatedAt'>
): Promise<Workflow> {
  const res = await apiClient<ApiSuccessResponse<Workflow>>('/api/workflows', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateWorkflow(
  id: string,
  data: Partial<Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Workflow> {
  const res = await apiClient<ApiSuccessResponse<Workflow>>(`/api/workflows/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteWorkflow(id: string): Promise<{ id: string; deleted: boolean }> {
  const res = await apiClient<ApiSuccessResponse<{ id: string; deleted: boolean }>>(
    `/api/workflows/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    }
  );
  return res.data;
}

export async function simulateWorkflowRun(id: string, triggerEntityId?: string): Promise<WorkflowExecution> {
  const res = await apiClient<ApiSuccessResponse<WorkflowExecution>>(
    `/api/workflows/${encodeURIComponent(id)}/run`,
    {
      method: 'POST',
      body: JSON.stringify({ triggerEntityId }),
    }
  );
  return res.data;
}

export async function fetchWorkflowExecutions(
  params?: {
    workflowId?: string;
    status?: 'all' | 'success' | 'skipped' | 'failed';
    page?: number;
    pageSize?: number;
  },
  signal?: AbortSignal
): Promise<WorkflowExecutionsResponse> {
  const search = new URLSearchParams();
  if (params?.workflowId && params.workflowId !== 'all') search.set('workflowId', params.workflowId);
  if (params?.status && params.status !== 'all') search.set('status', params.status);
  if (params?.page) search.set('page', String(params.page));
  if (params?.pageSize) search.set('pageSize', String(params.pageSize));

  const qs = search.toString();
  const url = `/api/workflows/executions${qs ? `?${qs}` : ''}`;
  const res = await apiClient<ApiSuccessResponse<WorkflowExecution[]>>(url, {
    method: 'GET',
    signal,
  });

  return {
    data: res.data,
    meta: {
      page: res.meta?.page || params?.page || 1,
      pageSize: res.meta?.pageSize || params?.pageSize || 25,
      totalItems: res.meta?.totalItems ?? res.data.length,
      totalPages: res.meta?.totalPages || 1,
    },
  };
}
