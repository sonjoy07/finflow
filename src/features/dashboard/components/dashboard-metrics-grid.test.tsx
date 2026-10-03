import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardMetricsGrid } from './dashboard-metrics-grid';
import type { DashboardSummary } from '../types/dashboard.types';

describe('DashboardMetricsGrid Component', () => {
  const mockSummary: DashboardSummary = {
    totalVolumeCents: 124508000,
    successfulTransactionsCount: 1840,
    failedTransactionsCount: 42,
    pendingTransactionsCount: 15,
    authorizationRate: 97.77,
    averageProcessingTimeMs: 145,
    volumeDeltaPercent: 8.4,
    unreconciledDiscrepancyCents: 184500,
  };

  it('renders all required metrics correctly', () => {
    render(<DashboardMetricsGrid summary={mockSummary} />);

    // Total Volume
    expect(screen.getByText('Total Volume')).toBeInTheDocument();
    expect(screen.getByText('$1,245,080.00')).toBeInTheDocument();
    expect(screen.getByText('+8.40%')).toBeInTheDocument();

    // Successful Transactions
    expect(screen.getByText('Successful')).toBeInTheDocument();
    expect(screen.getByText('1,840')).toBeInTheDocument();

    // Failed Transactions
    expect(screen.getByText('Failed (Exceptions)')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();

    // Pending Transactions
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();

    // Authorization Rate
    expect(screen.getByText('Auth Success Rate')).toBeInTheDocument();
    expect(screen.getByText('97.77%')).toBeInTheDocument();

    // Average Processing Time
    expect(screen.getByText('Avg Processing Time')).toBeInTheDocument();
    expect(screen.getByText('145')).toBeInTheDocument();
  });
});
