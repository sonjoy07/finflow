import type { UserRole } from '@/types';

export type ActivityAction =
  | 'TRANSACTION_RETRY'
  | 'RECONCILIATION_RESOLVE'
  | 'WORKFLOW_TRIGGERED'
  | 'DISCREPANCY_FLAGGED'
  | 'WORKFLOW_CREATE'
  | 'WORKFLOW_UPDATE'
  | 'EXPORT_DATA';

export type ActivityEntityType = 'transaction' | 'reconciliation' | 'workflow' | 'export';

export type ActivityResult = 'success' | 'failed' | 'flagged' | 'warning';

export interface SeedActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId: string;
  result?: ActivityResult;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
}

export function generateSeedActivityLogs(): SeedActivityLog[] {
  return [
    {
      id: 'act_001',
      actorId: 'usr_ops_02',
      actorName: 'Elena Vance',
      actorRole: 'operations_lead',
      action: 'TRANSACTION_RETRY',
      entityType: 'transaction',
      entityId: 'txn_0042',
      result: 'success',
      description: 'Triggered simulated retry for decline "network_timeout" with idempotency key idem_retry_42.',
      metadata: {
        attempt: 2,
        maxRetries: 3,
        gateway: 'Stripe Direct Core',
        idempotencyKey: 'idem_retry_42',
        originalDecline: 'GATEWAY_TIMEOUT',
      },
      ipAddress: '192.0.2.14',
      timestamp: '2026-11-01T13:45:10.000Z',
    },
    {
      id: 'act_002',
      actorId: 'usr_sys_01',
      actorName: 'Automation Engine',
      actorRole: 'admin',
      action: 'WORKFLOW_TRIGGERED',
      entityType: 'workflow',
      entityId: 'wf_auto_retry_timeouts',
      result: 'success',
      description: 'Auto-retried transaction txn_0038 after 30s exponential backoff delay.',
      metadata: {
        trigger: 'transaction_failed',
        actionExecuted: 'auto_retry',
        durationMs: 78,
      },
      ipAddress: '10.0.4.1',
      timestamp: '2026-11-01T13:20:00.000Z',
    },
    {
      id: 'act_003',
      actorId: 'usr_analyst_03',
      actorName: 'Marcus Brody',
      actorRole: 'analyst',
      action: 'RECONCILIATION_RESOLVE',
      entityType: 'reconciliation',
      entityId: 'rec_88319',
      result: 'success',
      description: 'Resolved fee discrepancy of -$5.00 against Chase Settlement batch #402.',
      metadata: {
        varianceDeltaCents: 500,
        currency: 'USD',
        notes: 'Interchange adjustment confirmed with provider rep.',
      },
      ipAddress: '198.51.100.22',
      timestamp: '2026-11-01T12:05:42.000Z',
    },
    {
      id: 'act_004',
      actorId: 'usr_risk_engine',
      actorName: 'Risk Guard Core',
      actorRole: 'admin',
      action: 'DISCREPANCY_FLAGGED',
      entityType: 'transaction',
      entityId: 'txn_0019',
      result: 'flagged',
      description: 'Transaction flagged: customer risk score (78/100) exceeds threshold limit.',
      metadata: {
        riskScore: 78,
        threshold: 75,
        flagReason: 'SUSPICIOUS_CARD_VELOCITY',
      },
      ipAddress: '10.0.4.5',
      timestamp: '2026-11-01T11:32:15.000Z',
    },
    {
      id: 'act_005',
      actorId: 'usr_ops_02',
      actorName: 'Elena Vance',
      actorRole: 'operations_lead',
      action: 'TRANSACTION_RETRY',
      entityType: 'transaction',
      entityId: 'txn_0012',
      result: 'success',
      description: 'Simulated smart retry for failed card payment of $1,490.00.',
      metadata: {
        amountCents: 149000,
        currency: 'USD',
        method: 'card',
      },
      ipAddress: '192.0.2.14',
      timestamp: '2026-11-01T10:14:22.000Z',
    },
    {
      id: 'act_006',
      actorId: 'usr_admin_01',
      actorName: 'Sarah Connor',
      actorRole: 'admin',
      action: 'WORKFLOW_CREATE',
      entityType: 'workflow',
      entityId: 'wf_vip_chargeback_triage',
      result: 'success',
      description: 'Created new automation rule: VIP Tier Chargeback Auto-Triage.',
      metadata: {
        trigger: 'high_risk_transaction',
        actionsCount: 2,
      },
      ipAddress: '198.51.100.8',
      timestamp: '2026-11-01T09:20:11.000Z',
    },
    {
      id: 'act_007',
      actorId: 'usr_analyst_03',
      actorName: 'Marcus Brody',
      actorRole: 'analyst',
      action: 'EXPORT_DATA',
      entityType: 'export',
      entityId: 'exp_txns_20261101',
      result: 'success',
      description: 'Exported 142 filtered settlement records to CSV format.',
      metadata: {
        format: 'CSV',
        recordsCount: 142,
        filtersApplied: { status: 'failed' },
      },
      ipAddress: '198.51.100.22',
      timestamp: '2026-11-01T08:45:00.000Z',
    },
    {
      id: 'act_008',
      actorId: 'usr_admin_01',
      actorName: 'Sarah Connor',
      actorRole: 'admin',
      action: 'WORKFLOW_UPDATE',
      entityType: 'workflow',
      entityId: 'wf_auto_retry_timeouts',
      result: 'success',
      description: 'Updated condition operator on rule "Smart Retry on Gateway Timeouts".',
      metadata: {
        fieldUpdated: 'conditions',
        newOperator: 'gt',
      },
      ipAddress: '198.51.100.8',
      timestamp: '2026-10-31T17:15:30.000Z',
    },
    {
      id: 'act_009',
      actorId: 'usr_ops_02',
      actorName: 'Elena Vance',
      actorRole: 'operations_lead',
      action: 'RECONCILIATION_RESOLVE',
      entityType: 'reconciliation',
      entityId: 'rec_88310',
      result: 'success',
      description: 'Resolved timing break with Adyen SFTP clearing window.',
      metadata: {
        batchId: 'batch_2026_10_30_001',
        resolutionType: 'TIMING_BREAK_SETTLED',
      },
      ipAddress: '192.0.2.14',
      timestamp: '2026-10-31T14:10:00.000Z',
    },
    {
      id: 'act_010',
      actorId: 'usr_sys_01',
      actorName: 'Automation Engine',
      actorRole: 'admin',
      action: 'WORKFLOW_TRIGGERED',
      entityType: 'workflow',
      entityId: 'wf_chargeback_alert',
      result: 'warning',
      description: 'Triggered Slack alert for disputed transaction txn_0088.',
      metadata: {
        slackChannel: '#disputes-alerts',
        httpStatus: 200,
      },
      ipAddress: '10.0.4.1',
      timestamp: '2026-10-31T11:02:18.000Z',
    },
    {
      id: 'act_011',
      actorId: 'usr_ops_02',
      actorName: 'Elena Vance',
      actorRole: 'operations_lead',
      action: 'TRANSACTION_RETRY',
      entityType: 'transaction',
      entityId: 'txn_0094',
      result: 'failed',
      description: 'Simulated retry attempt rejected: downstream bank rail offline.',
      metadata: {
        attempt: 3,
        maxRetries: 3,
        error: 'BANK_RAIL_UNAVAILABLE',
      },
      ipAddress: '192.0.2.14',
      timestamp: '2026-10-30T16:40:00.000Z',
    },
    {
      id: 'act_012',
      actorId: 'usr_analyst_03',
      actorName: 'Marcus Brody',
      actorRole: 'analyst',
      action: 'RECONCILIATION_RESOLVE',
      entityType: 'reconciliation',
      entityId: 'rec_88299',
      result: 'success',
      description: 'Manually matched orphan provider settlement from Silicon Valley Bank rail.',
      metadata: {
        matchedAmountCents: 850000,
      },
      ipAddress: '198.51.100.22',
      timestamp: '2026-10-30T10:15:33.000Z',
    },
  ];
}
