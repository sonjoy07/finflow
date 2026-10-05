import type { ReconciliationMatchStatus } from '@/lib/mock-data/seed-reconciliation';

export type { ReconciliationMatchStatus };

export interface ReconciliationHistoryEvent {
  timestamp: string;
  action: string;
  actor: string;
  notes?: string;
}

export interface ReconciliationRecord {
  id: string;
  batchId: string;
  internalTransactionId?: string | null;
  externalGatewayReference: string;
  gatewayName: string;
  internalAmountCents?: number | null;
  externalAmountCents: number;
  feeDeductedCents: number;
  netSettledCents: number;
  currency: string;
  matchStatus: ReconciliationMatchStatus;
  discrepancyDeltaCents: number;
  mismatchReason?: string | null;
  settledAt: string;
  resolvedAt?: string | null;
  resolutionNotes?: string | null;
  resolvedBy?: string | null;
  history?: ReconciliationHistoryEvent[];
}

export interface ReconciliationSummary {
  totalRecords: number;
  matchedCount: number;
  mismatchedCount: number;
  duplicateCount: number;
  missingProviderCount: number;
  missingInternalCount: number;
  resolvedCount: number;
  discrepancyTotalCents: number;
  netSettledTotalCents: number;
  matchRatePercentage: number;
}

export interface ReconciliationFilters {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ReconciliationDataResponse {
  records: ReconciliationRecord[];
  summary: ReconciliationSummary;
}

export interface ResolveReconciliationParams {
  id: string;
  notes: string;
  action?: 'force_match' | 'accept_external' | 'write_off' | 'flag_investigation';
}
