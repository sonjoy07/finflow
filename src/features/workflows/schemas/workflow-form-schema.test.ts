import { describe, it, expect } from 'vitest';
import { workflowFormSchema } from './workflow-form-schema';

describe('workflowFormSchema', () => {
  const validWorkflow = {
    name: 'Smart Retry on Gateway Timeout',
    description: 'Auto retries failed payments when gateway timed out.',
    status: 'active' as const,
    trigger: {
      eventType: 'transaction_failed' as const,
    },
    conditions: [
      { field: 'failureReason', operator: 'eq' as const, value: 'network_timeout' },
      { field: 'retryCount', operator: 'lt' as const, value: 3 },
    ],
    actions: [
      { type: 'auto_retry' as const, params: { maxAttempts: 2, backoff: 'exponential' } },
      { type: 'notify_slack' as const, params: { channel: '#ops-alerts' } },
    ],
  };

  it('validates a well-formed workflow configuration', () => {
    const result = workflowFormSchema.safeParse(validWorkflow);
    expect(result.success).toBe(true);
  });

  it('fails when workflow name is too short', () => {
    const result = workflowFormSchema.safeParse({
      ...validWorkflow,
      name: 'ab',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('name'))).toBe(true);
    }
  });

  it('fails when conditions list is empty', () => {
    const result = workflowFormSchema.safeParse({
      ...validWorkflow,
      conditions: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('conditions'))).toBe(true);
    }
  });

  it('fails when actions list is empty', () => {
    const result = workflowFormSchema.safeParse({
      ...validWorkflow,
      actions: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('actions'))).toBe(true);
    }
  });

  it('flags incompatible trigger and action combinations', () => {
    // auto_retry is only valid for transaction_failed, not reconciliation_mismatch
    const result = workflowFormSchema.safeParse({
      ...validWorkflow,
      trigger: {
        eventType: 'reconciliation_mismatch' as const,
      },
      conditions: [
        { field: 'discrepancyDeltaCents', operator: 'gt' as const, value: 10000 },
      ],
      actions: [
        { type: 'auto_retry' as const, params: {} },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.path.includes('actions') && i.message.includes('cannot be triggered by')
        )
      ).toBe(true);
    }
  });

  it('flags incompatible condition fields for trigger', () => {
    // discrepancyDeltaCents is not valid for transaction_failed
    const result = workflowFormSchema.safeParse({
      ...validWorkflow,
      conditions: [
        { field: 'discrepancyDeltaCents', operator: 'gt' as const, value: 10000 },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.path.includes('conditions') && i.message.includes('is incompatible with trigger')
        )
      ).toBe(true);
    }
  });

  it('enforces numeric values for gt and lt comparison operators', () => {
    const result = workflowFormSchema.safeParse({
      ...validWorkflow,
      conditions: [
        { field: 'retryCount', operator: 'lt' as const, value: 'not-a-number' },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.path.includes('conditions') && i.message.includes('requires a valid numeric value')
        )
      ).toBe(true);
    }
  });

  it('requires a channel parameter when notify_slack action is chosen', () => {
    const result = workflowFormSchema.safeParse({
      ...validWorkflow,
      actions: [
        { type: 'notify_slack' as const, params: { channel: '' } },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message.includes('Slack channel is required')
        )
      ).toBe(true);
    }
  });
});
