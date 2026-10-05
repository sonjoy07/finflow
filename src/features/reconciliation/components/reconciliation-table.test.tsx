import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { ReconciliationTable } from './reconciliation-table';
import type { ReconciliationRecord } from '../types/reconciliation.types';

const mockRecords: ReconciliationRecord[] = [
  {
    id: 'rec_0001',
    batchId: 'batch_chase_001',
    internalTransactionId: 'txn_0001',
    externalGatewayReference: 'ext_ref_80001',
    gatewayName: 'JPMorgan Chase Clearing',
    internalAmountCents: 11250,
    externalAmountCents: 11250,
    feeDeductedCents: 248,
    netSettledCents: 11002,
    currency: 'USD',
    matchStatus: 'matched',
    discrepancyDeltaCents: 0,
    settledAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'rec_0002',
    batchId: 'batch_adyen_002',
    internalTransactionId: 'txn_0002',
    externalGatewayReference: 'ext_ref_80002',
    gatewayName: 'Adyen Daily Settlement',
    internalAmountCents: 22500,
    externalAmountCents: 21500,
    feeDeductedCents: 473,
    netSettledCents: 21027,
    currency: 'USD',
    matchStatus: 'mismatched_amount',
    discrepancyDeltaCents: 1000,
    mismatchReason: 'Internal ledger specifies $225.00, but provider reports $215.00.',
    settledAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'rec_0003',
    batchId: 'batch_svb_003',
    internalTransactionId: null,
    externalGatewayReference: 'ext_ref_80003',
    gatewayName: 'Silicon Valley Commercial',
    internalAmountCents: null,
    externalAmountCents: 50000,
    feeDeductedCents: 1100,
    netSettledCents: 48900,
    currency: 'USD',
    matchStatus: 'missing_internal',
    discrepancyDeltaCents: 50000,
    mismatchReason: 'Settlement processed by bank but no matching internal order.',
    settledAt: '2026-11-01T06:00:00Z',
  },
];

describe('ReconciliationTable', () => {
  const defaultProps = {
    records: mockRecords,
    onSelectRecord: vi.fn(),
    onOpenResolveModal: vi.fn(),
  };

  it('renders table headers and records with distinguishable status badges', () => {
    render(<ReconciliationTable {...defaultProps} />);

    expect(screen.getByText('rec_0001')).toBeInTheDocument();
    expect(screen.getByText('txn_0001')).toBeInTheDocument();
    expect(screen.getByText('JPMorgan Chase Clearing')).toBeInTheDocument();
    expect(screen.getAllByText('$112.50').length).toBe(2);
    expect(screen.getByText('Matched')).toBeInTheDocument();

    expect(screen.getByText('rec_0002')).toBeInTheDocument();
    expect(screen.getByText('Amount Variance')).toBeInTheDocument();
    expect(screen.getByText('+$10.00')).toBeInTheDocument();

    expect(screen.getByText('rec_0003')).toBeInTheDocument();
    expect(screen.getByText('Missing Internal')).toBeInTheDocument();
    expect(screen.getByText('None (Unlinked)')).toBeInTheDocument();
  });

  it('triggers onSelectRecord when clicking compare button or row', () => {
    const onSelectRecord = vi.fn();
    render(<ReconciliationTable {...defaultProps} onSelectRecord={onSelectRecord} />);

    const compareButtons = screen.getAllByRole('button', { name: /compare records for/i });
    expect(compareButtons.length).toBeGreaterThan(0);

    fireEvent.click(compareButtons[0]!);
    expect(onSelectRecord).toHaveBeenCalledWith(mockRecords[0]);
  });

  it('triggers onOpenResolveModal only for unresolved records', () => {
    const onOpenResolveModal = vi.fn();
    render(<ReconciliationTable {...defaultProps} onOpenResolveModal={onOpenResolveModal} />);

    // rec_0001 is matched, so only rec_0002 and rec_0003 have resolve buttons
    const resolveButtons = screen.getAllByRole('button', { name: /resolve discrepancy for/i });
    expect(resolveButtons.length).toBe(2);

    fireEvent.click(resolveButtons[0]!);
    expect(onOpenResolveModal).toHaveBeenCalledWith(mockRecords[1]);
  });

  it('renders empty state when records array is empty', () => {
    render(<ReconciliationTable {...defaultProps} records={[]} />);

    expect(screen.getByText(/no reconciliation records found/i)).toBeInTheDocument();
  });
});
