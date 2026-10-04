import type { CurrencyCode, PaymentMethodType, TransactionStatus } from '@/types';
import type { SeedCustomer, TransactionTimelineEvent } from '@/lib/mock-data/seed-transactions';

export interface TransactionListItem {
  id: string;
  referenceId: string;
  amountCents: number;
  currency: CurrencyCode;
  status: TransactionStatus;
  paymentMethod: PaymentMethodType;
  paymentMethodDetails: {
    brand?: string;
    last4?: string;
    expiry?: string;
    bankName?: string;
    accountLast4?: string;
  };
  customer: SeedCustomer;
  failureReason: string | null;
  processingTimeMs: number;
  retryCount: number;
  maxRetriesAllowed: number;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDetail extends TransactionListItem {
  idempotencyKey?: string | null;
  gatewayResponse?: {
    gateway: string;
    gatewayTransactionId: string;
    rawCode: string;
    rawMessage: string;
    declineCode?: string;
    networkLatencyMs: number;
    rawPayload: Record<string, unknown>;
  };
  timeline: TransactionTimelineEvent[];
}

export interface TransactionFilters {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  paymentMethod?: string;
  minAmountCents?: number;
  maxAmountCents?: number;
  from?: string;
  to?: string;
  sortBy?: 'createdAt' | 'amountCents' | 'status' | 'customerName';
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionListResponse {
  data: TransactionListItem[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface RetryTransactionResponse {
  transaction: TransactionDetail;
  executionId: string;
  status: 'processing' | 'succeeded';
  gatewayMessage: string;
}
