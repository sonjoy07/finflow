import type { SeedTransaction } from '@/lib/mock-data/seed-transactions';
import type { TransactionDetail } from '@/features/transactions/types/transaction.types';

export const mockFailedCardTransaction: TransactionDetail = {
  id: 'txn_test_001',
  referenceId: 'ref_test_001',
  amountCents: 15000,
  currency: 'USD',
  status: 'failed',
  paymentMethod: 'card',
  paymentMethodDetails: {
    brand: 'Visa',
    last4: '4242',
    expiry: '12/28',
  },
  customer: {
    id: 'cust_test_1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    riskScore: 24,
    tier: 'standard',
  },
  failureReason: 'insufficient_funds',
  processingTimeMs: 240,
  retryCount: 1,
  maxRetriesAllowed: 3,
  idempotencyKey: 'idem_test_card_001',
  createdAt: '2026-11-01T10:00:00.000Z',
  updatedAt: '2026-11-01T10:05:00.000Z',
  gatewayResponse: {
    gateway: 'Stripe Direct Core',
    gatewayTransactionId: 'ch_test_123',
    rawCode: 'CARD_DECLINED',
    rawMessage: 'Your card has insufficient funds.',
    networkLatencyMs: 240,
    rawPayload: { simulated: true },
  },
  timeline: [
    {
      id: 'tl_1',
      event: 'TRANSACTION_INITIATED',
      timestamp: '2026-11-01T10:00:00.000Z',
      description: 'Transaction initiated by customer checkout.',
      actor: 'Customer Webhook',
    },
    {
      id: 'tl_2',
      event: 'GATEWAY_DECLINED',
      timestamp: '2026-11-01T10:00:01.000Z',
      description: 'Gateway returned insufficient_funds code.',
      actor: 'Stripe Direct Core',
    },
  ],
};

export const mockSettledBankTransaction: TransactionDetail = {
  id: 'txn_test_002',
  referenceId: 'ref_test_002',
  amountCents: 850000,
  currency: 'USD',
  status: 'settled',
  paymentMethod: 'bank_transfer',
  paymentMethodDetails: {
    bankName: 'Silicon Valley Bank',
    accountLast4: '9988',
  },
  customer: {
    id: 'cust_test_2',
    name: 'SaaS Alpha Ventures',
    email: 'finance@alphaventures.com',
    riskScore: 12,
    tier: 'enterprise',
  },
  failureReason: null,
  processingTimeMs: 180,
  retryCount: 0,
  maxRetriesAllowed: 3,
  idempotencyKey: 'idem_test_ach_002',
  createdAt: '2026-11-01T09:00:00.000Z',
  updatedAt: '2026-11-01T09:01:00.000Z',
  gatewayResponse: {
    gateway: 'ACH Direct Rail',
    gatewayTransactionId: 'ach_test_888',
    rawCode: 'SETTLED',
    rawMessage: 'Funds cleared clearinghouse window.',
    networkLatencyMs: 180,
    rawPayload: { simulated: true },
  },
  timeline: [
    {
      id: 'tl_1',
      event: 'TRANSACTION_SETTLED',
      timestamp: '2026-11-01T09:01:00.000Z',
      description: 'Settled via clearinghouse ACH rail.',
      actor: 'FinFlow Clearinghouse Listener',
    },
  ],
};

export const mockExhaustedRetryTransaction: TransactionDetail = {
  ...mockFailedCardTransaction,
  id: 'txn_test_003',
  retryCount: 3,
  maxRetriesAllowed: 3,
};
