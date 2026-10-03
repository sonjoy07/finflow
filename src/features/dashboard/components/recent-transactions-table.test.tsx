import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentTransactionsTable } from './recent-transactions-table';
import type { SeedTransaction } from '@/lib/mock-data/seed-transactions';

describe('RecentTransactionsTable Component', () => {
  const mockTransactions: SeedTransaction[] = [
    {
      id: 'txn_0001',
      referenceId: 'ref_0001',
      amountCents: 24999,
      currency: 'USD',
      status: 'settled',
      paymentMethod: 'card',
      paymentMethodDetails: { brand: 'Visa', last4: '4242' },
      customer: {
        id: 'cust_001',
        name: 'Acme Corp',
        email: 'billing@acme.example',
        tier: 'enterprise',
        riskScore: 10,
      },
      failureReason: null,
      processingTimeMs: 120,
      retryCount: 0,
      maxRetriesAllowed: 3,
      timeline: [],
      createdAt: '2026-11-01T10:00:00.000Z',
      updatedAt: '2026-11-01T10:00:00.120Z',
    },
    {
      id: 'txn_0002',
      referenceId: 'ref_0002',
      amountCents: 85000,
      currency: 'USD',
      status: 'failed',
      paymentMethod: 'bank_transfer',
      paymentMethodDetails: { bankName: 'Chase', accountLast4: '8821' },
      customer: {
        id: 'cust_002',
        name: 'Nexus Dynamics',
        email: 'ops@nexus.example',
        tier: 'enterprise',
        riskScore: 18,
      },
      failureReason: 'insufficient_funds',
      processingTimeMs: 250,
      retryCount: 1,
      maxRetriesAllowed: 3,
      timeline: [],
      createdAt: '2026-11-01T09:30:00.000Z',
      updatedAt: '2026-11-01T09:30:00.250Z',
    },
  ];

  it('renders table columns, customers, amounts, and statuses accurately', () => {
    render(<RecentTransactionsTable transactions={mockTransactions} />);

    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('$249.99')).toBeInTheDocument();
    expect(screen.getByText('Settled')).toBeInTheDocument();

    expect(screen.getByText('Nexus Dynamics')).toBeInTheDocument();
    expect(screen.getByText('$850.00')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });
});
