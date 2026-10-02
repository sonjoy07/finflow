import { describe, it, expect } from 'vitest';
import { mockRepository } from './mock-repository';

describe('mockRepository', () => {
  it('generates consistent dashboard metrics for time horizons', () => {
    const data7d = mockRepository.getDashboardMetrics('7d');
    expect(data7d.timeRange).toBe('7d');
    expect(data7d.summary.totalVolumeCents).toBeGreaterThan(0);
    expect(data7d.summary.successfulTransactionsCount).toBeGreaterThan(0);
    expect(data7d.summary.authorizationRate).toBeGreaterThan(70);
  });

  describe('Transactions querying, filtering, and pagination', () => {
    it('paginates transactions accurately with metadata', () => {
      const page1 = mockRepository.getTransactions({ page: 1, pageSize: 10 });
      expect(page1.data.length).toBe(10);
      expect(page1.meta.page).toBe(1);
      expect(page1.meta.pageSize).toBe(10);
      expect(page1.meta.totalItems).toBeGreaterThan(100);
      expect(page1.meta.totalPages).toBe(Math.ceil(page1.meta.totalItems / 10));

      const page2 = mockRepository.getTransactions({ page: 2, pageSize: 10 });
      expect(page2.data.length).toBe(10);
      expect(page2.data[0]?.id).not.toBe(page1.data[0]?.id);
    });

    it('filters transactions by status', () => {
      const failed = mockRepository.getTransactions({ status: 'failed', pageSize: 100 });
      expect(failed.data.length).toBeGreaterThan(0);
      failed.data.forEach((txn) => {
        expect(txn.status).toBe('failed');
      });
    });

    it('filters transactions by payment method', () => {
      const cardTxns = mockRepository.getTransactions({ paymentMethod: 'card', pageSize: 100 });
      expect(cardTxns.data.length).toBeGreaterThan(0);
      cardTxns.data.forEach((txn) => {
        expect(txn.paymentMethod).toBe('card');
      });
    });

    it('filters transactions by search query q', () => {
      const searched = mockRepository.getTransactions({ q: 'Acme', pageSize: 50 });
      expect(searched.data.length).toBeGreaterThan(0);
      searched.data.forEach((txn) => {
        const matches =
          txn.customer.name.toLowerCase().includes('acme') ||
          txn.customer.email.toLowerCase().includes('acme') ||
          txn.id.toLowerCase().includes('acme');
        expect(matches).toBe(true);
      });
    });

    it('sorts transactions by amount ascending and descending', () => {
      const asc = mockRepository.getTransactions({ sortBy: 'amountCents', sortOrder: 'asc', pageSize: 10 });
      for (let i = 0; i < asc.data.length - 1; i++) {
        const current = asc.data[i]?.amountCents ?? 0;
        const next = asc.data[i + 1]?.amountCents ?? 0;
        expect(current).toBeLessThanOrEqual(next);
      }

      const desc = mockRepository.getTransactions({ sortBy: 'amountCents', sortOrder: 'desc', pageSize: 10 });
      for (let i = 0; i < desc.data.length - 1; i++) {
        const current = desc.data[i]?.amountCents ?? 0;
        const next = desc.data[i + 1]?.amountCents ?? 0;
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });
  });

  describe('Transaction Retry Simulation & Idempotency', () => {
    it('successfully processes a retry for an eligible failed transaction', () => {
      // Find a failed transaction
      const failed = mockRepository.getTransactions({ status: 'failed', pageSize: 50 });
      const target = failed.data.find((t) => t.retryCount < 3);
      expect(target).toBeDefined();

      if (target) {
        const initialRetries = target.retryCount;
        const idempotencyKey = `idem_test_${Date.now()}`;
        const result = mockRepository.retryTransaction(target.id, idempotencyKey, 'Unit test retry');

        expect(result.status).toBe('processing');
        expect(result.transaction.status).toBe('processing');
        expect(result.transaction.retryCount).toBe(initialRetries + 1);

        // Attempting to retry again with same idempotency key throws DUPLICATE_IDEMPOTENCY_KEY
        expect(() => {
          mockRepository.retryTransaction(target.id, idempotencyKey);
        }).toThrow('DUPLICATE_IDEMPOTENCY_KEY');
      }
    });

    it('rejects retry on settled transaction', () => {
      const settled = mockRepository.getTransactions({ status: 'settled', pageSize: 10 });
      const target = settled.data[0];
      expect(target).toBeDefined();

      if (target) {
        expect(() => {
          mockRepository.retryTransaction(target.id, `idem_${Date.now()}`);
        }).toThrow('TRANSACTION_ALREADY_RESOLVED');
      }
    });

    it('throws TRANSACTION_NOT_FOUND on non-existent ID', () => {
      expect(() => {
        mockRepository.retryTransaction('txn_non_existent_9999', 'idem_9999');
      }).toThrow('TRANSACTION_NOT_FOUND');
    });
  });

  describe('Reconciliation operations', () => {
    it('retrieves paginated reconciliation records and filters by status', () => {
      const all = mockRepository.getReconciliationRecords();
      expect(all.data.length).toBeGreaterThan(0);

      const mismatched = mockRepository.getReconciliationRecords('mismatched_amount');
      mismatched.data.forEach((r) => {
        expect(r.matchStatus).toBe('mismatched_amount');
      });
    });

    it('resolves a reconciliation discrepancy record', () => {
      const records = mockRepository.getReconciliationRecords('mismatched_amount');
      const target = records.data[0];
      expect(target).toBeDefined();

      if (target) {
        const resolved = mockRepository.resolveReconciliationRecord(target.id, 'Fee confirmed with Chase.');
        expect(resolved.matchStatus).toBe('resolved');
        expect(resolved.resolutionNotes).toContain('Chase');
      }
    });
  });

  describe('Workflows & Notifications', () => {
    it('lists, creates, and updates workflows', () => {
      const initial = mockRepository.getWorkflows();
      expect(initial.length).toBeGreaterThan(0);

      const created = mockRepository.createWorkflow({
        name: 'New Test Workflow',
        description: 'Test workflow description',
        status: 'active',
        trigger: { eventType: 'transaction_failed' },
        conditions: [{ field: 'amountCents', operator: 'gt', value: 50000 }],
        actions: [{ type: 'notify_slack', params: { channel: '#test' } }],
      });

      expect(created.id).toBeDefined();
      expect(created.name).toBe('New Test Workflow');

      const updated = mockRepository.updateWorkflow(created.id, { status: 'paused' });
      expect(updated.status).toBe('paused');
    });

    it('fetches notifications with unreadOnly toggle', () => {
      const all = mockRepository.getNotifications(false);
      const unread = mockRepository.getNotifications(true);
      expect(all.length).toBeGreaterThanOrEqual(unread.length);
    });
  });
});
