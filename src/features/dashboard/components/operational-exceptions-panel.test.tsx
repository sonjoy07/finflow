import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OperationalExceptionsPanel } from './operational-exceptions-panel';
import type { DashboardSummary } from '../types/dashboard.types';
import type { SeedTransaction } from '@/lib/mock-data/seed-transactions';

describe('OperationalExceptionsPanel Component', () => {
  const mockSummary: DashboardSummary = {
    totalVolumeCents: 124508000,
    successfulTransactionsCount: 1840,
    failedTransactionsCount: 2,
    pendingTransactionsCount: 15,
    authorizationRate: 97.77,
    averageProcessingTimeMs: 145,
    volumeDeltaPercent: 8.4,
    unreconciledDiscrepancyCents: 184500,
  };

  const mockFailedTransactions: SeedTransaction[] = [
    {
      id: 'txn_fail_01',
      referenceId: 'ref_fail_01',
      amountCents: 149500,
      currency: 'USD',
      status: 'failed',
      paymentMethod: 'card',
      paymentMethodDetails: { brand: 'Visa', last4: '4242' },
      customer: {
        id: 'cust_01',
        name: 'Alpha Capital',
        email: 'ops@alphacap.example',
        tier: 'enterprise',
        riskScore: 12,
      },
      failureReason: 'network_timeout',
      processingTimeMs: 15000,
      retryCount: 1,
      maxRetriesAllowed: 3,
      timeline: [],
      createdAt: '2026-11-01T12:00:00.000Z',
      updatedAt: '2026-11-01T12:00:15.000Z',
    },
    {
      id: 'txn_fail_02',
      referenceId: 'ref_fail_02',
      amountCents: 75000,
      currency: 'USD',
      status: 'failed',
      paymentMethod: 'card',
      paymentMethodDetails: { brand: 'Mastercard', last4: '5555' },
      customer: {
        id: 'cust_02',
        name: 'Beta Global',
        email: 'billing@betaglobal.example',
        tier: 'enterprise',
        riskScore: 24,
      },
      failureReason: 'expired_card',
      processingTimeMs: 120,
      retryCount: 0,
      maxRetriesAllowed: 3,
      timeline: [],
      createdAt: '2026-11-01T11:45:00.000Z',
      updatedAt: '2026-11-01T11:45:00.120Z',
    },
  ];

  it('renders operational exceptions header, failure cards, and discrepancy alert', () => {
    render(
      <OperationalExceptionsPanel
        summary={mockSummary}
        recentTransactions={mockFailedTransactions}
      />
    );

    expect(screen.getByText('Operational Exceptions Requiring Triage')).toBeInTheDocument();
    expect(screen.getByText('Ledger Settlement Variance Break')).toBeInTheDocument();
    expect(screen.getByText('Alpha Capital')).toBeInTheDocument();
    expect(screen.getByText('$1,495.00')).toBeInTheDocument();
    expect(screen.getByText('network_timeout')).toBeInTheDocument();
    expect(screen.getByText('expired_card')).toBeInTheDocument();
  });

  it('triggers onSelectTransaction when clicking Diagnose button', () => {
    const onSelectTransaction = vi.fn();
    render(
      <OperationalExceptionsPanel
        summary={mockSummary}
        recentTransactions={mockFailedTransactions}
        onSelectTransaction={onSelectTransaction}
      />
    );

    const diagnoseBtns = screen.getAllByRole('button', { name: /diagnose/i });
    expect(diagnoseBtns[0]).toBeDefined();
    fireEvent.click(diagnoseBtns[0]!);
    expect(onSelectTransaction).toHaveBeenCalledWith('txn_fail_01');
  });

  it('displays healthy state banner when there are no exceptions and zero discrepancy', () => {
    const cleanSummary: DashboardSummary = {
      ...mockSummary,
      failedTransactionsCount: 0,
      unreconciledDiscrepancyCents: 0,
    };

    render(
      <OperationalExceptionsPanel
        summary={cleanSummary}
        recentTransactions={[]}
      />
    );

    expect(screen.getByText('Operational Queue Clear')).toBeInTheDocument();
    expect(screen.getByText('100% HEALTHY')).toBeInTheDocument();
  });
});
