import { z } from 'zod';
import {
  TRIGGER_COMPATIBLE_FIELDS,
  TRIGGER_COMPATIBLE_ACTIONS,
  WorkflowTriggerType,
  WorkflowOperator,
  WorkflowActionType,
} from '../types/workflow.types';

export const workflowConditionSchema = z.object({
  field: z.string().min(1, 'Condition field is required'),
  operator: z.enum(['eq', 'neq', 'gt', 'lt', 'in', 'contains'] as const, {
    errorMap: () => ({ message: 'Please select a valid comparison operator' }),
  }),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

export const workflowActionSchema = z.object({
  type: z.enum(['auto_retry', 'notify_slack', 'create_ticket', 'freeze_account'] as const, {
    errorMap: () => ({ message: 'Please select a valid action type' }),
  }),
  params: z.record(z.unknown()).default({}),
});

export const workflowFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Workflow name must be at least 3 characters')
      .max(60, 'Workflow name cannot exceed 60 characters'),
    description: z
      .string()
      .trim()
      .max(200, 'Description cannot exceed 200 characters')
      .default(''),
    status: z.enum(['active', 'paused'] as const).default('active'),
    trigger: z.object({
      eventType: z.enum([
        'transaction_failed',
        'reconciliation_mismatch',
        'high_risk_transaction',
      ] as const, {
        errorMap: () => ({ message: 'Please select a valid trigger event' }),
      }),
    }),
    conditions: z
      .array(workflowConditionSchema)
      .min(1, 'At least one condition rule must be configured'),
    actions: z
      .array(workflowActionSchema)
      .min(1, 'At least one action must be configured'),
  })
  .superRefine((data, ctx) => {
    const trigger = data.trigger.eventType as WorkflowTriggerType;
    const compatibleFields = TRIGGER_COMPATIBLE_FIELDS[trigger] || [];
    const validFieldNames = new Set(compatibleFields.map((f) => f.name));
    const allowedActions = new Set(TRIGGER_COMPATIBLE_ACTIONS[trigger] || []);

    // 1. Condition Validations
    data.conditions.forEach((cond, idx) => {
      // Validate field compatibility
      if (!validFieldNames.has(cond.field)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Field "${cond.field}" is incompatible with trigger "${trigger}".`,
          path: ['conditions', idx, 'field'],
        });
      }

      // Validate value is not empty
      if (cond.value === '' || cond.value === undefined || cond.value === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Condition comparison value cannot be empty.',
          path: ['conditions', idx, 'value'],
        });
      }

      // Validate numeric operators require numbers
      if (['gt', 'lt'].includes(cond.operator)) {
        const numVal = Number(cond.value);
        if (isNaN(numVal) || String(cond.value).trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Operator "${cond.operator}" requires a valid numeric value.`,
            path: ['conditions', idx, 'value'],
          });
        }
      }
    });

    // 2. Action Validations
    data.actions.forEach((act, idx) => {
      // Validate action compatibility with trigger
      if (!allowedActions.has(act.type as WorkflowActionType)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Action "${act.type}" cannot be triggered by "${trigger}".`,
          path: ['actions', idx, 'type'],
        });
      }

      // Validate action parameters
      if (act.type === 'auto_retry') {
        const maxAttempts = Number(act.params?.maxAttempts);
        if (act.params?.maxAttempts !== undefined && (isNaN(maxAttempts) || maxAttempts < 1 || maxAttempts > 5)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Max retry attempts must be between 1 and 5.',
            path: ['actions', idx, 'params', 'maxAttempts'],
          });
        }
      }

      if (act.type === 'notify_slack') {
        const channel = String(act.params?.channel || '').trim();
        if (!channel) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Slack channel is required (e.g., #ops-alerts).',
            path: ['actions', idx, 'params', 'channel'],
          });
        }
      }
    });
  });

export type WorkflowFormValues = z.infer<typeof workflowFormSchema>;
