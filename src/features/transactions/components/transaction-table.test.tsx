import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { TransactionTable } from './transaction-table';
import type { TransactionListItem } from '../types/transaction.types';

const mockTransactions: TransactionListItem[] = [
  {
    id: 'tx_test_001',
    referenceId: 'ref_001',
    amountCents: 125000,
    currency: 'USD',
    status: 'settled',
    paymentMethod: 'card',
    paymentMethodDetails: { brand: 'Visa', last4: '4242' },
    customer: {
      id: 'cust_001',
      name: 'Acme Global Corp',
      email: 'billing@acme.com',
      tier: 'enterprise',
      riskScore: 12,
    },
    failureReason: null,
    processingTimeMs: 320,
    retryCount: 0,
    maxRetriesAllowed: 3,
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-03-15T10:00:01Z',
  },
  {
    id: 'tx_test_002',
    referenceId: 'ref_002',
    amountCents: 45000,
    currency: 'USD',
    status: 'failed',
    paymentMethod: 'bank_transfer',
    paymentMethodDetails: { bankName: 'JPMorgan Chase', accountLast4: '9876' },
    customer: {
      id: 'cust_002',
      name: 'Fintech Solutions Ltd',
      email: 'ops@fintech.io',
      tier: 'standard',
      riskScore: 84,
    },
    failureReason: 'Insufficient funds on originating rail',
    processingTimeMs: 1450,
    retryCount: 1,
    maxRetriesAllowed: 3,
    createdAt: '2026-03-14T08:30:00Z',
    updatedAt: '2026-03-14T08:30:05Z',
  },
];

describe('TransactionTable', () => {
  const defaultProps = {
    data: mockTransactions,
    columnVisibility: {},
    onColumnVisibilityChange: vi.fn(),
    rowSelection: {},
    onRowSelectionChange: vi.fn(),
    sortBy: 'createdAt',
    sortOrder: 'desc' as const,
    onSortChange: vi.fn(),
    onSelectTransaction: vi.fn(),
  };

  it('renders table headers and transaction rows', () => {
    render(<TransactionTable {...defaultProps} />);

    expect(screen.getByText('Acme Global Corp')).toBeInTheDocument();
    expect(screen.getByText('Fintech Solutions Ltd')).toBeInTheDocument();
    expect(screen.getByText('$1,250.00')).toBeInTheDocument();
    expect(screen.getByText('$450.00')).toBeInTheDocument();
    expect(screen.getByText('Settled')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('triggers onSortChange when sortable header buttons are clicked', () => {
    const onSortChange = vi.fn();
    render(<TransactionTable {...defaultProps} onSortChange={onSortChange} />);

    const customerHeader = screen.getByRole('button', { name: /customer/i });
    fireEvent.click(customerHeader);
    expect(onSortChange).toHaveBeenCalledWith('customerName');

    const amountHeader = screen.getByRole('button', { name: /amount/i });
    fireEvent.click(amountHeader);
    expect(onSortChange).toHaveBeenCalledWith('amountCents');
  });

  it('triggers onSelectTransaction when clicking a row or view action', () => {
    const onSelectTransaction = vi.fn();
    render(<TransactionTable {...defaultProps} onSelectTransaction={onSelectTransaction} />);

    const viewButtons = screen.getAllByRole('button', { name: /inspect details for/i });
    expect(viewButtons.length).toBeGreaterThan(0);
    fireEvent.click(viewButtons[0]!);
    expect(onSelectTransaction).toHaveBeenCalledWith('tx_test_001');

    const row = screen.getByText('Fintech Solutions Ltd').closest('tr');
    expect(row).not.toBeNull();
    if (row) {
      fireEvent.click(row);
      expect(onSelectTransaction).toHaveBeenCalledWith('tx_test_002');
    }
  });

  it('renders empty row message when data array is empty', () => {
    render(<TransactionTable {...defaultProps} data={[]} />);

    expect(screen.getByText(/no transactions found/i)).toBeInTheDocument();
  });
});
