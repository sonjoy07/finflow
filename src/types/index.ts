/**
 * Shared Core Domain Types for FinFlow
 */

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD';

export type UserRole = 'admin' | 'operations_lead' | 'analyst' | 'auditor';

export type PaymentMethodType =
  | 'card'
  | 'bank_transfer'
  | 'virtual_account'
  | 'ach'
  | 'sepa'
  | 'wire';

export type TransactionStatus =
  | 'settled'
  | 'pending'
  | 'processing'
  | 'failed'
  | 'refunded'
  | 'disputed'
  | 'cancelled';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    totalItems?: number;
    totalPages?: number;
  };
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      issue: string;
    }>;
  };
  timestamp: string;
}
