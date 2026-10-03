import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { DashboardMetricsGrid } from './dashboard-metrics-grid';

// Mock dashboard loading & error component states
function DashboardContainer({
  isLoading,
  isError,
  data,
  onRetry,
}: {
  isLoading: boolean;
  isError: boolean;
  data: any;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <div data-testid="dashboard-loading" aria-label="Loading dashboard metrics" className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div data-testid="dashboard-error" className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto" aria-hidden="true" />
        <p className="text-sm font-semibold text-destructive">Failed to load dashboard metrics.</p>
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 text-xs mx-auto">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Loading</span>
        </Button>
      </div>
    );
  }

  return (
    <div data-testid="dashboard-success">
      <DashboardMetricsGrid summary={data.summary} />
    </div>
  );
}

describe('Dashboard Loading, Error, and Success States', () => {
  it('renders loading skeleton fallbacks while data is loading', () => {
    render(
      <DashboardContainer
        isLoading={true}
        isError={false}
        data={null}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading dashboard metrics')).toBeInTheDocument();
  });

  it('renders error boundary alert and retry action on failure', () => {
    const handleRetry = vi.fn();
    render(
      <DashboardContainer
        isLoading={false}
        isError={true}
        data={null}
        onRetry={handleRetry}
      />
    );

    expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load dashboard metrics.')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /retry loading/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('renders KPI summary cards successfully when data is loaded', () => {
    const mockSummary = {
      totalVolumeCents: 124508000,
      successfulTransactionsCount: 1240,
      failedTransactionsCount: 38,
      pendingTransactionsCount: 15,
      authorizationRate: 97.02,
      averageProcessingTimeMs: 185,
      volumeDeltaPercent: 8.4,
      unreconciledDiscrepancyCents: 184500,
    };

    render(
      <DashboardContainer
        isLoading={false}
        isError={false}
        data={{ summary: mockSummary }}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByTestId('dashboard-success')).toBeInTheDocument();
    expect(screen.getByText('$1,245,080.00')).toBeInTheDocument();
    expect(screen.getByText('97.02%')).toBeInTheDocument();
  });
});
