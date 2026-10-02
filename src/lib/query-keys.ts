import { transactionKeys } from '@/features/transactions/api/transaction-keys';
import { dashboardKeys } from '@/features/dashboard/api/dashboard-keys';

export { transactionKeys, dashboardKeys };

export const reconciliationKeys = {
  all: ['reconciliation'] as const,
  lists: () => [...reconciliationKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...reconciliationKeys.lists(), filters] as const,
  details: () => [...reconciliationKeys.all, 'detail'] as const,
  detail: (id: string) => [...reconciliationKeys.details(), id] as const,
};

export const workflowKeys = {
  all: ['workflows'] as const,
  lists: () => [...workflowKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...workflowKeys.lists(), filters] as const,
  details: () => [...workflowKeys.all, 'detail'] as const,
  detail: (id: string) => [...workflowKeys.details(), id] as const,
  executions: (workflowId: string) => [...workflowKeys.detail(workflowId), 'executions'] as const,
  allExecutions: (filters?: Record<string, unknown>) => [...workflowKeys.all, 'executions', filters] as const,
};

export const notificationKeys = {
  all: ['notifications'] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...notificationKeys.lists(), filters] as const,
};

export const activityKeys = {
  all: ['activity'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...activityKeys.lists(), filters] as const,
};
