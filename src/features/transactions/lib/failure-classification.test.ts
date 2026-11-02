import { describe, it, expect } from 'vitest';
import { classifyFailureReason } from './failure-classification';

describe('Transaction Failure Classification & Safe Retry Policies', () => {
  it('classifies network_timeout as transient with exponential backoff strategy', () => {
    const policy = classifyFailureReason('network_timeout');
    expect(policy.classification).toBe('transient');
    expect(policy.isRetryable).toBe(true);
    expect(policy.recommendedStrategy).toBe('exponential_backoff');
    expect(policy.recommendedGatewayFailover).toBe(true);
    expect(policy.visaCategory).toBe('Category 1 (Permitted)');
  });

  it('classifies expired_card as hard_decline and prohibits automatic retries', () => {
    const policy = classifyFailureReason('expired_card');
    expect(policy.classification).toBe('hard_decline');
    expect(policy.isRetryable).toBe(false);
    expect(policy.recommendedStrategy).toBe('prohibited');
    expect(policy.maxRecommendedAttempts).toBe(0);
    expect(policy.visaCategory).toBe('Category 3 (Prohibited)');
  });

  it('classifies do_not_honor as hard decline requiring customer contact', () => {
    const policy = classifyFailureReason('do_not_honor');
    expect(policy.classification).toBe('hard_decline');
    expect(policy.isRetryable).toBe(false);
    expect(policy.recommendedStrategy).toBe('customer_contact');
    expect(policy.visaCategory).toBe('Category 3 (Prohibited)');
  });

  it('classifies insufficient_funds as soft decline with 24-hour cooling window', () => {
    const policy = classifyFailureReason('insufficient_funds');
    expect(policy.classification).toBe('soft_decline');
    expect(policy.isRetryable).toBe(true);
    expect(policy.coolingOffMinutes).toBe(1440);
  });

  it('provides safe fallback policy for unknown decline reasons', () => {
    const policy = classifyFailureReason('some_weird_error_from_issuer');
    expect(policy.isRetryable).toBe(true);
    expect(policy.maxRecommendedAttempts).toBe(1);
  });
});
