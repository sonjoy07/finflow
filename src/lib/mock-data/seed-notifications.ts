export interface SeedNotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}

export function generateSeedNotifications(): SeedNotificationItem[] {
  return [
    {
      id: 'notif_001',
      title: 'Discrepancy Detected',
      message: 'Settlement batch #batch_2026_10_30_001 has 2 amount mismatches totaling -$15.00.',
      severity: 'warning',
      read: false,
      linkUrl: '/reconciliation',
      createdAt: '2026-11-01T13:30:00.000Z',
    },
    {
      id: 'notif_002',
      title: 'Gateway Alert: Card Velocity',
      message: 'Spike in card_velocity_exceeded declines observed on Acquiring Gateway Alpha.',
      severity: 'error',
      read: false,
      linkUrl: '/transactions?status=failed',
      createdAt: '2026-11-01T12:15:00.000Z',
    },
    {
      id: 'notif_003',
      title: 'Workflow Execution Succeeded',
      message: 'Workflow "Smart Retry on Gateway Timeouts" successfully processed txn_0042.',
      severity: 'success',
      read: false,
      linkUrl: '/workflows/executions',
      createdAt: '2026-11-01T11:45:00.000Z',
    },
    {
      id: 'notif_004',
      title: 'Daily Settlement Batch Cleared',
      message: 'JPMorgan Chase ACH settlement batch for Oct 31 fully balanced with zero discrepancies.',
      severity: 'info',
      read: true,
      linkUrl: '/reconciliation',
      createdAt: '2026-11-01T08:00:00.000Z',
    },
    {
      id: 'notif_005',
      title: 'High-Risk Velocity Threshold Flagged',
      message: 'Transaction txn_0019 flagged for manual operator review (Risk score: 78).',
      severity: 'warning',
      read: false,
      linkUrl: '/transactions?q=txn_0019',
      createdAt: '2026-10-31T18:20:00.000Z',
    },
    {
      id: 'notif_006',
      title: 'Acquiring Settlement Ingested',
      message: 'Adyen SFTP Settlement batch #batch_2026_10_30_002 ingested (50 records).',
      severity: 'info',
      read: true,
      linkUrl: '/reconciliation',
      createdAt: '2026-10-31T16:00:00.000Z',
    },
    {
      id: 'notif_007',
      title: 'Downstream Gateway Recovery',
      message: 'Acquiring connector Silicon Valley Bank resumed normal latency after brief slowdown.',
      severity: 'success',
      read: true,
      linkUrl: '/dashboard',
      createdAt: '2026-10-31T12:00:00.000Z',
    },
  ];
}
