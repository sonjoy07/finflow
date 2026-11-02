/**
 * Production-grade Transaction Failure Classification & Safe Retry Policy.
 * Based on card network operating regulations (Visa Core Rules & Mastercard Settlement Protocols)
 * to prevent excessive retry penalties, merchant reputation degradation, and acquiring rate-limiting.
 */

export type FailureClassification = 'transient' | 'soft_decline' | 'hard_decline' | 'fraud_velocity';

export type RetryStrategy = 'immediate' | 'exponential_backoff' | 'customer_contact' | 'prohibited';

export interface RetryPolicyRecommendation {
  classification: FailureClassification;
  isRetryable: boolean;
  recommendedStrategy: RetryStrategy;
  recommendedGatewayFailover: boolean;
  rationale: string;
  maxRecommendedAttempts: number;
  visaCategory: 'Category 1 (Permitted)' | 'Category 2 (Conditional)' | 'Category 3 (Prohibited)';
  coolingOffMinutes: number;
}

const FAILURE_CLASSIFICATION_MAP: Record<string, RetryPolicyRecommendation> = {
  network_timeout: {
    classification: 'transient',
    isRetryable: true,
    recommendedStrategy: 'exponential_backoff',
    recommendedGatewayFailover: true,
    maxRecommendedAttempts: 3,
    visaCategory: 'Category 1 (Permitted)',
    coolingOffMinutes: 1,
    rationale: 'Network connection or socket dropped between gateway and acquiring bank. Exponential backoff retry is safe.',
  },
  gateway_unavailable: {
    classification: 'transient',
    isRetryable: true,
    recommendedStrategy: 'immediate',
    recommendedGatewayFailover: true,
    maxRecommendedAttempts: 2,
    visaCategory: 'Category 1 (Permitted)',
    coolingOffMinutes: 0,
    rationale: 'Primary gateway reported 503 or circuit breaker trip. Automatic smart routing failover to secondary processor recommended.',
  },
  insufficient_funds: {
    classification: 'soft_decline',
    isRetryable: true,
    recommendedStrategy: 'exponential_backoff',
    recommendedGatewayFailover: false,
    maxRecommendedAttempts: 2,
    visaCategory: 'Category 2 (Conditional)',
    coolingOffMinutes: 1440, // 24 hours
    rationale: 'Issuing bank reported insufficient funds. Best retried during standard payroll disbursement cycles (24h-48h).',
  },
  card_velocity_exceeded: {
    classification: 'fraud_velocity',
    isRetryable: true,
    recommendedStrategy: 'exponential_backoff',
    recommendedGatewayFailover: false,
    maxRecommendedAttempts: 1,
    visaCategory: 'Category 2 (Conditional)',
    coolingOffMinutes: 60,
    rationale: 'Card velocity throttle exceeded. Safe to retry once cooling-off window (minimum 60 minutes) has expired.',
  },
  expired_card: {
    classification: 'hard_decline',
    isRetryable: false,
    recommendedStrategy: 'prohibited',
    recommendedGatewayFailover: false,
    maxRecommendedAttempts: 0,
    visaCategory: 'Category 3 (Prohibited)',
    coolingOffMinutes: 0,
    rationale: 'Instrument has expired. Card network mandates strictly prohibit re-presentment without customer payment credential update.',
  },
  do_not_honor: {
    classification: 'hard_decline',
    isRetryable: false,
    recommendedStrategy: 'customer_contact',
    recommendedGatewayFailover: false,
    maxRecommendedAttempts: 0,
    visaCategory: 'Category 3 (Prohibited)',
    coolingOffMinutes: 0,
    rationale: 'Generic decline code from cardholder bank. Re-attempting without cardholder bank authorization may incur network penalty fees.',
  },
};

const DEFAULT_RECOMMENDATION: RetryPolicyRecommendation = {
  classification: 'transient',
  isRetryable: true,
  recommendedStrategy: 'exponential_backoff',
  recommendedGatewayFailover: false,
  maxRecommendedAttempts: 1,
  visaCategory: 'Category 2 (Conditional)',
  coolingOffMinutes: 15,
  rationale: 'Unspecified decline or simulated condition. Conservative single-attempt retry policy applied.',
};

export function classifyFailureReason(reason: string | null | undefined): RetryPolicyRecommendation {
  if (!reason) {
    return DEFAULT_RECOMMENDATION;
  }
  const normalized = reason.toLowerCase().trim().replace(/\s+/g, '_');
  return FAILURE_CLASSIFICATION_MAP[normalized] || DEFAULT_RECOMMENDATION;
}
