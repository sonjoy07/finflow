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

export interface ActivityLog {
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

export interface ActivityFilterParams {
  page?: number;
  pageSize?: number;
  q?: string;
  role?: string;
  action?: string;
  entityType?: string;
  result?: string;
  from?: string;
  to?: string;
}
