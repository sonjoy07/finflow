import type { ReconciliationRecord } from '@/features/reconciliation/types/reconciliation.types';

export const mockMismatchedSettlement: ReconciliationRecord = {
  id: 'rec_fixture_001',
  batchId: 'batch_2026_11_01_001',
  internalTransactionId: 'txn_test_001',
  externalGatewayReference: 'gw_ref_001',
  gatewayName: 'Stripe Daily Clearing',
  internalAmountCents: 15000,
  externalAmountCents: 13500,
  feeDeductedCents: 450,
  netSettledCents: 13050,
  currency: 'USD',
  matchStatus: 'mismatched_amount',
  discrepancyDeltaCents: 1500,
  mismatchReason: 'Gateway deducted additional $15.00 interchange adjustment fee.',
  settledAt: '2026-11-01T14:00:00.000Z',
  history: [
    {
      timestamp: '2026-11-01T14:00:00.000Z',
      action: 'BATCH_INGESTED',
      actor: 'Automated Clearing Service',
      notes: 'Imported settlement record.',
    },
  ],
};

export const mockBalancedSettlement: ReconciliationRecord = {
  id: 'rec_fixture_002',
  batchId: 'batch_2026_11_01_001',
  internalTransactionId: 'txn_test_002',
  externalGatewayReference: 'gw_ref_002',
  gatewayName: 'Silicon Valley Bank ACH',
  internalAmountCents: 850000,
  externalAmountCents: 850000,
  feeDeductedCents: 1500,
  netSettledCents: 848500,
  currency: 'USD',
  matchStatus: 'matched',
  discrepancyDeltaCents: 0,
  settledAt: '2026-11-01T14:00:00.000Z',
  history: [
    {
      timestamp: '2026-11-01T14:00:00.000Z',
      action: 'BATCH_INGESTED',
      actor: 'Automated Clearing Service',
      notes: 'Balanced record.',
    },
  ],
};
