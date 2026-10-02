export type ReconciliationMatchStatus =
  | 'matched'
  | 'unmatched'
  | 'mismatched_amount'
  | 'duplicate_record'
  | 'missing_provider'
  | 'missing_internal'
  | 'missing_external'
  | 'resolved';

export interface SeedReconciliationRecord {
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
  history?: Array<{
    timestamp: string;
    action: string;
    actor: string;
    notes?: string;
  }>;
}

export function generateSeedReconciliationRecords(): SeedReconciliationRecord[] {
  const records: SeedReconciliationRecord[] = [];
  const baseTime = new Date('2026-11-01T12:00:00.000Z').getTime();

  const statuses: ReconciliationMatchStatus[] = [
    'matched',
    'matched',
    'mismatched_amount',
    'matched',
    'duplicate_record',
    'missing_provider',
    'matched',
    'missing_internal',
    'unmatched',
    'resolved',
  ];

  const gateways = [
    'JPMorgan Chase Clearing',
    'Adyen Daily Settlement',
    'Silicon Valley Commercial',
    'Stripe Treasury Core',
  ];

  for (let i = 1; i <= 60; i++) {
    const id = `rec_${i.toString().padStart(4, '0')}`;
    const batchId = `batch_2026_10_${((i % 5) + 25).toString().padStart(2, '0')}_001`;
    const gatewayName = gateways[i % gateways.length] || 'JPMorgan Chase Clearing';
    const externalGatewayReference = `ext_ref_${80000 + i}`;
    const matchStatus = statuses[(i - 1) % statuses.length] || 'matched';

    const baseAmount = (i * 1250) + 10000; // e.g. $112.50
    const feeDeductedCents = Math.round(baseAmount * 0.022); // 2.2% gateway fee

    let internalAmountCents: number | null = baseAmount;
    let externalAmountCents = baseAmount;
    let discrepancyDeltaCents = 0;
    let internalTransactionId: string | null = `txn_${i.toString().padStart(4, '0')}`;
    let mismatchReason: string | null = null;
    let resolvedAt: string | null = null;
    let resolutionNotes: string | null = null;
    let resolvedBy: string | null = null;

    if (matchStatus === 'mismatched_amount') {
      const diff = ((i % 4) + 1) * 500; // $5.00 to $20.00 diff
      externalAmountCents = baseAmount - diff;
      discrepancyDeltaCents = diff;
      mismatchReason = `Internal ledger specifies $${(baseAmount / 100).toFixed(2)}, but provider gross settlement reports $${(externalAmountCents / 100).toFixed(2)} (delta: $${(diff / 100).toFixed(2)}).`;
    } else if (matchStatus === 'missing_internal') {
      internalAmountCents = null;
      internalTransactionId = null;
      discrepancyDeltaCents = externalAmountCents;
      mismatchReason = `Acquiring rail processed settlement of $${(externalAmountCents / 100).toFixed(2)}, but no originating order was recorded in FinFlow internal ledger.`;
    } else if (matchStatus === 'missing_provider' || matchStatus === 'missing_external') {
      externalAmountCents = 0;
      discrepancyDeltaCents = internalAmountCents;
      mismatchReason = `Internal transaction ${internalTransactionId} authorized, but missing from provider daily settlement batch.`;
    } else if (matchStatus === 'duplicate_record') {
      discrepancyDeltaCents = externalAmountCents;
      mismatchReason = `External reference ${externalGatewayReference} duplicate entry encountered in clearing batch ${batchId}.`;
    } else if (matchStatus === 'unmatched') {
      discrepancyDeltaCents = 0;
      mismatchReason = 'Timestamp skew exceeds 48-hour matching threshold between authorization and bank clearing.';
    } else if (matchStatus === 'resolved') {
      resolvedAt = new Date(baseTime - 3600 * 1000 * (i % 24)).toISOString();
      resolutionNotes = 'Interchange fee adjustment verified with banking partner. Variance approved.';
      resolvedBy = 'Marcus Brody (Analyst)';
    }

    const netSettledCents = Math.max(0, externalAmountCents - feeDeductedCents);
    const settledAt = new Date(baseTime - (i * 7200 * 1000)).toISOString();

    const history = [
      {
        timestamp: settledAt,
        action: 'BATCH_INGESTED',
        actor: `${gatewayName} SFTP Sync`,
        notes: `Imported via automated clearing window ${batchId}.`,
      },
    ];

    if (matchStatus === 'resolved') {
      history.push({
        timestamp: resolvedAt || settledAt,
        action: 'MANUAL_RESOLUTION',
        actor: resolvedBy || 'Operations Lead',
        notes: resolutionNotes || 'Discrepancy reconciled.',
      });
    }

    records.push({
      id,
      batchId,
      internalTransactionId,
      externalGatewayReference,
      gatewayName,
      internalAmountCents,
      externalAmountCents,
      feeDeductedCents,
      netSettledCents,
      currency: 'USD',
      matchStatus,
      discrepancyDeltaCents,
      mismatchReason,
      settledAt,
      resolvedAt,
      resolutionNotes,
      resolvedBy,
      history,
    });
  }

  return records;
}
