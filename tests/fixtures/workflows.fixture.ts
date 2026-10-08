import type { Workflow, WorkflowExecution } from '@/features/workflows/types/workflow.types';

export const mockAutoRetryWorkflow: Workflow = {
  id: 'wf_fixture_001',
  name: 'Smart Retry on Gateway Timeouts',
  description: 'Automatically schedules exponential backoff retries when acquiring connector times out.',
  status: 'active',
  trigger: {
    eventType: 'transaction_failed',
  },
  conditions: [
    {
      field: 'failureReason',
      operator: 'contains',
      value: 'timeout',
    },
    {
      field: 'retryCount',
      operator: 'lt',
      value: 3,
    },
  ],
  actions: [
    {
      type: 'auto_retry',
      params: { maxAttempts: 2, backoffStrategy: 'exponential' },
    },
    {
      type: 'notify_slack',
      params: { channel: '#ops-retry-alerts' },
    },
  ],
  executionCount: 24,
  lastExecutedAt: '2026-11-01T13:45:00.000Z',
  createdAt: '2026-10-15T08:00:00.000Z',
  updatedAt: '2026-11-01T13:45:00.000Z',
};

export const mockExecutionRecord: WorkflowExecution = {
  id: 'wfe_fixture_001',
  workflowId: 'wf_fixture_001',
  workflowName: 'Smart Retry on Gateway Timeouts',
  triggerEntityId: 'txn_test_001',
  triggerEntityType: 'transaction',
  status: 'success',
  durationMs: 85,
  stepLogs: [
    {
      stepNumber: 1,
      stepName: 'Evaluate Condition: failureReason contains timeout',
      status: 'success',
      outputMessage: 'Rule condition satisfied. Observed payload value: "Gateway timeout".',
    },
    {
      stepNumber: 2,
      stepName: 'Execute Action: AUTO RETRY',
      status: 'success',
      outputMessage: 'Dispatched smart retry simulation payload. Status: queued.',
    },
  ],
  executedAt: '2026-11-01T13:45:00.000Z',
};
