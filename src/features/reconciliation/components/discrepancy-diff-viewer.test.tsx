import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { DiscrepancyDiffViewer } from './discrepancy-diff-viewer';
import type { ReconciliationRecord } from '../types/reconciliation.types';

const mockMismatchedRecord: ReconciliationRecord = {
  id: 'rec_test_diff',
  batchId: 'batch_2026_10_28_001',
  internalTransactionId: 'txn_app_42',
  externalGatewayReference: 'ext_ref_998877',
  gatewayName: 'Adyen Daily Settlement',
  internalAmountCents: 45000,
  externalAmountCents: 40000,
  feeDeductedCents: 880,
  netSettledCents: 39120,
  currency: 'USD',
  matchStatus: 'mismatched_amount',
  discrepancyDeltaCents: 5000,
  mismatchReason: 'Gateway deducted additional $50.00 interchange adjustment.',
  settledAt: '2026-10-28T14:30:00Z',
  history: [
    {
      timestamp: '2026-10-28T14:30:00Z',
      action: 'BATCH_INGESTED',
      actor: 'Adyen SFTP Sync',
      notes: 'Imported via automated clearing window.',
    },
  ],
};

const mockResolvedRecord: ReconciliationRecord = {
  ...mockMismatchedRecord,
  id: 'rec_test_resolved',
  matchStatus: 'resolved',
  resolvedAt: '2026-10-29T10:00:00Z',
  resolvedBy: 'Elena Vance (Ops Lead)',
  resolutionNotes: 'Interchange adjustment confirmed with Adyen account rep.',
  history: [
    ...mockMismatchedRecord.history!,
    {
      timestamp: '2026-10-29T10:00:00Z',
      action: 'MANUAL_RESOLUTION',
      actor: 'Elena Vance (Ops Lead)',
      notes: 'Interchange adjustment confirmed with Adyen account rep.',
    },
  ],
};

let mockCanResolve = true;

vi.mock('@/features/auth/hooks/use-permission', () => ({
  usePermission: () => ({
    can: (permission: string) => (permission === 'RECONCILIATION_RESOLVE' ? mockCanResolve : true),
    role: mockCanResolve ? 'admin' : 'auditor',
    isAdmin: mockCanResolve,
    isOperationsLead: false,
    isAnalyst: mockCanResolve,
    isAuditor: !mockCanResolve,
  }),
}));

describe('DiscrepancyDiffViewer', () => {
  it('renders nothing active when record is null', () => {
    render(
      <DiscrepancyDiffViewer
        record={null}
        onClose={vi.fn()}
        onResolve={vi.fn()}
      />
    );
    expect(screen.queryByText('Internal Ledger')).not.toBeInTheDocument();
  });

  it('renders side-by-side internal and external comparison details with mismatch reason', () => {
    render(
      <DiscrepancyDiffViewer
        record={mockMismatchedRecord}
        onClose={vi.fn()}
        onResolve={vi.fn()}
      />
    );

    expect(screen.getByText(/reconciliation rec_test_diff/i)).toBeInTheDocument();
    expect(screen.getByText('Internal Ledger')).toBeInTheDocument();
    expect(screen.getByText('txn_app_42')).toBeInTheDocument();
    expect(screen.getByText('$450.00')).toBeInTheDocument();

    expect(screen.getByText('Provider Settlement')).toBeInTheDocument();
    expect(screen.getByText('ext_ref_998877')).toBeInTheDocument();
    expect(screen.getByText('$400.00')).toBeInTheDocument();
    expect(screen.getByText('+$50.00')).toBeInTheDocument();

    // Mismatch reason callout
    expect(screen.getByText(/Gateway deducted additional \$50\.00 interchange adjustment\./i)).toBeInTheDocument();

    // History check
    expect(screen.getByText(/Adyen SFTP Sync/i)).toBeInTheDocument();
  });

  it('shows manual resolution button for unresolved records and triggers onResolve', () => {
    const onResolve = vi.fn();
    render(
      <DiscrepancyDiffViewer
        record={mockMismatchedRecord}
        onClose={vi.fn()}
        onResolve={onResolve}
      />
    );

    const resolveBtn = screen.getByRole('button', { name: /simulate manual reconciliation/i });
    expect(resolveBtn).toBeInTheDocument();

    fireEvent.click(resolveBtn);
    expect(onResolve).toHaveBeenCalledWith(mockMismatchedRecord);
  });

  it('displays resolution audit stamp and hides resolve button for resolved records', () => {
    mockCanResolve = true;
    render(
      <DiscrepancyDiffViewer
        record={mockResolvedRecord}
        onClose={vi.fn()}
        onResolve={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /simulate manual reconciliation/i })).not.toBeInTheDocument();
    expect(screen.getByText('Manual Resolution Audit Record')).toBeInTheDocument();
    expect(screen.getByText('Elena Vance (Ops Lead)')).toBeInTheDocument();
    expect(screen.getAllByText(/Interchange adjustment confirmed with Adyen account rep/i).length).toBeGreaterThanOrEqual(1);
  });

  it('hides resolve button and displays restricted permission message when user lacks RECONCILIATION_RESOLVE permission', () => {
    mockCanResolve = false;
    render(
      <DiscrepancyDiffViewer
        record={mockMismatchedRecord}
        onClose={vi.fn()}
        onResolve={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /simulate manual reconciliation/i })).not.toBeInTheDocument();
    expect(screen.getByText(/manual resolution restricted: operator lacks reconciliation_resolve permission/i)).toBeInTheDocument();
    mockCanResolve = true;
  });
});
