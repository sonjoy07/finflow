export interface WorkflowCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'contains';
  value: string | number | boolean | string[];
}

export interface WorkflowAction {
  type: 'auto_retry' | 'notify_slack' | 'create_ticket' | 'freeze_account';
  params: Record<string, unknown>;
}

export interface SeedWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused';
  trigger: {
    eventType: 'transaction_failed' | 'reconciliation_mismatch' | 'high_risk_transaction';
  };
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  executionCount: number;
  lastExecutedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeedWorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerEntityId: string;
  triggerEntityType: 'transaction' | 'reconciliation_record';
  status: 'success' | 'failed' | 'skipped';
  durationMs: number;
  stepLogs: Array<{
    stepNumber: number;
    stepName: string;
    status: 'success' | 'failed' | 'skipped';
    outputMessage: string;
  }>;
  executedAt: string;
}

export function generateSeedWorkflows(): { workflows: SeedWorkflow[]; executions: SeedWorkflowExecution[] } {
  const workflows: SeedWorkflow[] = [
    {
      id: 'wf_auto_retry_timeouts',
      name: 'Smart Retry on Gateway Timeouts',
      description: 'Automatically retry failed card payments when decline code is network_timeout for enterprise clients.',
      status: 'active',
      trigger: {
        eventType: 'transaction_failed',
      },
      conditions: [
        { field: 'failureReason', operator: 'eq', value: 'network_timeout' },
        { field: 'customer.tier', operator: 'eq', value: 'enterprise' },
      ],
      actions: [
        { type: 'auto_retry', params: { strategy: 'exponential_backoff', maxAttempts: 2 } },
        { type: 'notify_slack', params: { channel: '#ops-alerts', notifyOnSuccess: false } },
      ],
      executionCount: 142,
      lastExecutedAt: '2026-11-01T13:20:00.000Z',
      createdAt: '2026-10-15T09:00:00.000Z',
      updatedAt: '2026-10-28T14:30:00.000Z',
    },
    {
      id: 'wf_high_value_discrepancy_escalate',
      name: 'High-Value Discrepancy Escalation',
      description: 'Creates high-priority ticket and flags ledger when reconciliation difference exceeds $1,000.00.',
      status: 'active',
      trigger: {
        eventType: 'reconciliation_mismatch',
      },
      conditions: [
        { field: 'discrepancyDeltaCents', operator: 'gt', value: 100000 },
      ],
      actions: [
        { type: 'create_ticket', params: { priority: 'critical', queue: 'Finance-Ops' } },
        { type: 'notify_slack', params: { channel: '#finance-escalations' } },
      ],
      executionCount: 18,
      lastExecutedAt: '2026-10-31T18:45:10.000Z',
      createdAt: '2026-10-20T11:00:00.000Z',
      updatedAt: '2026-10-20T11:00:00.000Z',
    },
    {
      id: 'wf_freeze_high_risk_failures',
      name: 'Freeze Suspicious Velocity Failures',
      description: 'Temporarily freeze customer accounts when riskScore > 75 and multiple consecutive card declines occur.',
      status: 'paused',
      trigger: {
        eventType: 'high_risk_transaction',
      },
      conditions: [
        { field: 'customer.riskScore', operator: 'gt', value: 75 },
        { field: 'failureReason', operator: 'eq', value: 'card_velocity_exceeded' },
      ],
      actions: [
        { type: 'freeze_account', params: { durationMinutes: 120 } },
        { type: 'create_ticket', params: { priority: 'high', queue: 'Risk-Triage' } },
      ],
      executionCount: 4,
      lastExecutedAt: '2026-10-29T16:12:00.000Z',
      createdAt: '2026-10-22T08:30:00.000Z',
      updatedAt: '2026-10-30T10:15:00.000Z',
    },
  ];

  const executions: SeedWorkflowExecution[] = [
    {
      id: 'wfe_001',
      workflowId: 'wf_auto_retry_timeouts',
      workflowName: 'Smart Retry on Gateway Timeouts',
      triggerEntityId: 'txn_0042',
      triggerEntityType: 'transaction',
      status: 'success',
      durationMs: 145,
      stepLogs: [
        { stepNumber: 1, stepName: 'Evaluate Condition: failureReason == network_timeout', status: 'success', outputMessage: 'Condition matched (network_timeout).' },
        { stepNumber: 2, stepName: 'Evaluate Condition: customer.tier == enterprise', status: 'success', outputMessage: 'Condition matched (enterprise).' },
        { stepNumber: 3, stepName: 'Execute Action: Auto Retry', status: 'success', outputMessage: 'Dispatched retry request via StripeSim with idempotency key idem_0042_r1.' },
      ],
      executedAt: '2026-11-01T13:20:00.000Z',
    },
    {
      id: 'wfe_002',
      workflowId: 'wf_auto_retry_timeouts',
      workflowName: 'Smart Retry on Gateway Timeouts',
      triggerEntityId: 'txn_0021',
      triggerEntityType: 'transaction',
      status: 'skipped',
      durationMs: 42,
      stepLogs: [
        { stepNumber: 1, stepName: 'Evaluate Condition: failureReason == network_timeout', status: 'success', outputMessage: 'Condition matched.' },
        { stepNumber: 2, stepName: 'Evaluate Condition: customer.tier == enterprise', status: 'failed', outputMessage: 'Condition failed: customer tier is standard. Automation skipped.' },
      ],
      executedAt: '2026-11-01T11:15:00.000Z',
    },
    {
      id: 'wfe_003',
      workflowId: 'wf_high_value_discrepancy_escalate',
      workflowName: 'High-Value Discrepancy Escalation',
      triggerEntityId: 'rec_0008',
      triggerEntityType: 'reconciliation_record',
      status: 'success',
      durationMs: 220,
      stepLogs: [
        { stepNumber: 1, stepName: 'Evaluate Condition: discrepancyDeltaCents > 100000', status: 'success', outputMessage: 'Discrepancy delta ($1,450.00) exceeds threshold ($1,000.00).' },
        { stepNumber: 2, stepName: 'Execute Action: Create Ticket', status: 'success', outputMessage: 'Created Zendesk ticket #8892 in Finance-Ops queue.' },
        { stepNumber: 3, stepName: 'Execute Action: Notify Slack', status: 'success', outputMessage: 'Posted notification payload to #finance-escalations.' },
      ],
      executedAt: '2026-10-31T18:45:10.000Z',
    },
  ];

  return { workflows, executions };
}
