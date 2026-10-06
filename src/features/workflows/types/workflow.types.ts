export type WorkflowTriggerType =
  | 'transaction_failed'
  | 'reconciliation_mismatch'
  | 'high_risk_transaction';

export type WorkflowOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'contains';

export type WorkflowActionType =
  | 'auto_retry'
  | 'notify_slack'
  | 'create_ticket'
  | 'freeze_account';

export interface WorkflowCondition {
  field: string;
  operator: WorkflowOperator;
  value: string | number | boolean;
}

export interface WorkflowAction {
  type: WorkflowActionType;
  params: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused';
  trigger: {
    eventType: WorkflowTriggerType;
  };
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  executionCount: number;
  lastExecutedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStepLog {
  stepNumber: number;
  stepName: string;
  status: 'success' | 'failed' | 'skipped';
  outputMessage: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerEntityId: string;
  triggerEntityType: 'transaction' | 'reconciliation_record';
  status: 'success' | 'failed' | 'skipped';
  durationMs: number;
  stepLogs: WorkflowStepLog[];
  executedAt: string;
}

export interface WorkflowMetrics {
  activeCount: number;
  pausedCount: number;
  totalCount: number;
  totalExecutions: number;
  successRate: number;
  automatedRetries: number;
}

// Field definitions per trigger
export interface FieldDefinition {
  name: string;
  label: string;
  type: 'string' | 'number' | 'enum';
  options?: Array<{ label: string; value: string }>;
  supportedOperators: WorkflowOperator[];
  defaultValue?: string | number;
}

export const TRIGGER_COMPATIBLE_FIELDS: Record<WorkflowTriggerType, FieldDefinition[]> = {
  transaction_failed: [
    {
      name: 'failureReason',
      label: 'Failure Reason',
      type: 'enum',
      options: [
        { label: 'Network Timeout', value: 'network_timeout' },
        { label: 'Insufficient Funds', value: 'insufficient_funds' },
        { label: 'Card Velocity Exceeded', value: 'card_velocity_exceeded' },
        { label: 'Gateway Unavailable', value: 'gateway_unavailable' },
        { label: 'Suspected Fraud', value: 'fraud_suspected' },
        { label: 'Expired Card', value: 'expired_card' },
      ],
      supportedOperators: ['eq', 'neq', 'in'],
    },
    {
      name: 'retryCount',
      label: 'Retry Count',
      type: 'number',
      supportedOperators: ['eq', 'neq', 'lt', 'gt'],
      defaultValue: 0,
    },
    {
      name: 'amountCents',
      label: 'Amount (in Cents)',
      type: 'number',
      supportedOperators: ['eq', 'neq', 'gt', 'lt'],
      defaultValue: 10000,
    },
    {
      name: 'customer.tier',
      label: 'Customer Tier',
      type: 'enum',
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Premium', value: 'premium' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
      supportedOperators: ['eq', 'neq', 'in'],
    },
    {
      name: 'customer.riskScore',
      label: 'Risk Score (0-100)',
      type: 'number',
      supportedOperators: ['gt', 'lt', 'eq'],
      defaultValue: 50,
    },
    {
      name: 'paymentMethod',
      label: 'Payment Method',
      type: 'enum',
      options: [
        { label: 'Card', value: 'card' },
        { label: 'ACH Direct Debit', value: 'ach' },
        { label: 'Wire Transfer', value: 'wire' },
        { label: 'SEPA Direct', value: 'sepa' },
      ],
      supportedOperators: ['eq', 'neq', 'in'],
    },
  ],
  reconciliation_mismatch: [
    {
      name: 'discrepancyDeltaCents',
      label: 'Discrepancy Variance (Cents)',
      type: 'number',
      supportedOperators: ['gt', 'lt', 'eq'],
      defaultValue: 50000,
    },
    {
      name: 'gatewayName',
      label: 'Acquiring Gateway',
      type: 'enum',
      options: [
        { label: 'Stripe Sim', value: 'StripeSim' },
        { label: 'Adyen Sim', value: 'AdyenSim' },
        { label: 'Checkout.com Sim', value: 'CheckoutComSim' },
      ],
      supportedOperators: ['eq', 'neq', 'in'],
    },
    {
      name: 'matchStatus',
      label: 'Discrepancy Status',
      type: 'enum',
      options: [
        { label: 'Mismatched Amount', value: 'mismatched_amount' },
        { label: 'Missing Provider Record', value: 'missing_provider' },
        { label: 'Duplicate Settlement Record', value: 'duplicate_record' },
      ],
      supportedOperators: ['eq', 'neq'],
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'enum',
      options: [
        { label: 'USD ($)', value: 'USD' },
        { label: 'EUR (€)', value: 'EUR' },
        { label: 'GBP (£)', value: 'GBP' },
      ],
      supportedOperators: ['eq', 'neq'],
    },
  ],
  high_risk_transaction: [
    {
      name: 'customer.riskScore',
      label: 'Risk Score (0-100)',
      type: 'number',
      supportedOperators: ['gt', 'lt', 'eq'],
      defaultValue: 75,
    },
    {
      name: 'amountCents',
      label: 'Transaction Amount (Cents)',
      type: 'number',
      supportedOperators: ['gt', 'lt'],
      defaultValue: 100000,
    },
    {
      name: 'customer.tier',
      label: 'Customer Tier',
      type: 'enum',
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Premium', value: 'premium' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
      supportedOperators: ['eq', 'neq'],
    },
  ],
};

export const TRIGGER_COMPATIBLE_ACTIONS: Record<WorkflowTriggerType, WorkflowActionType[]> = {
  transaction_failed: ['auto_retry', 'notify_slack', 'create_ticket', 'freeze_account'],
  reconciliation_mismatch: ['create_ticket', 'notify_slack'],
  high_risk_transaction: ['freeze_account', 'create_ticket', 'notify_slack'],
};

export const TRIGGER_OPTIONS: Array<{ label: string; value: WorkflowTriggerType; description: string }> = [
  {
    value: 'transaction_failed',
    label: 'Transaction Failed',
    description: 'Triggered when an acquiring bank or processor returns a payment decline or timeout.',
  },
  {
    value: 'reconciliation_mismatch',
    label: 'Reconciliation Mismatch',
    description: 'Triggered when settlement ingestion detects an amount or status discrepancy.',
  },
  {
    value: 'high_risk_transaction',
    label: 'High-Risk Transaction Flagged',
    description: 'Triggered when an incoming transaction exceeds velocity or ML risk score thresholds.',
  },
];

export const ACTION_OPTIONS: Array<{
  value: WorkflowActionType;
  label: string;
  description: string;
  defaultParams: Record<string, unknown>;
}> = [
  {
    value: 'auto_retry',
    label: 'Simulate Smart Retry',
    description: 'Idempotently schedules an automated retry attempt with exponential backoff.',
    defaultParams: { maxAttempts: 2, backoff: 'exponential' },
  },
  {
    value: 'notify_slack',
    label: 'Notify Slack Ops Channel',
    description: 'Dispatches real-time incident alert to specified Slack webhook channel.',
    defaultParams: { channel: '#ops-alerts', notifyOnSuccess: false },
  },
  {
    value: 'create_ticket',
    label: 'Create Incident Ticket',
    description: 'Generates an actionable triage ticket in the internal operations queue.',
    defaultParams: { queue: 'Finance-Ops', priority: 'high' },
  },
  {
    value: 'freeze_account',
    label: 'Temporary Account Safety Hold',
    description: 'Places a temporary security freeze on customer transactions pending review.',
    defaultParams: { durationMinutes: 120 },
  },
];

export const OPERATOR_LABELS: Record<WorkflowOperator, string> = {
  eq: 'Equals (==)',
  neq: 'Does Not Equal (!=)',
  gt: 'Greater Than (>)',
  lt: 'Less Than (<)',
  in: 'One Of (in)',
  contains: 'Contains',
};
