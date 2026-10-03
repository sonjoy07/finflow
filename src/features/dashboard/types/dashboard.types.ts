import type { SeedTransaction } from '@/lib/mock-data/seed-transactions';
import type { SeedActivityLog } from '@/lib/mock-data/seed-activity';

export type TimeRange = '24h' | '7d' | '30d' | '90d';

export interface DashboardSummary {
  totalVolumeCents: number;
  successfulTransactionsCount: number;
  failedTransactionsCount: number;
  pendingTransactionsCount: number;
  authorizationRate: number;
  averageProcessingTimeMs: number;
  volumeDeltaPercent: number;
  unreconciledDiscrepancyCents: number;
}

export interface VolumePoint {
  date: string;
  settledCents: number;
  failedCents: number;
  pendingCents: number;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
  percentage: number;
}

export interface DashboardData {
  timeRange: TimeRange;
  summary: DashboardSummary;
  volumeOverTime: VolumePoint[];
  statusDistribution: StatusDistributionItem[];
  recentTransactions: SeedTransaction[];
  recentActivity: SeedActivityLog[];
}
