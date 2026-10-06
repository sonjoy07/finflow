'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  X,
  Plus,
  Trash2,
  AlertTriangle,
  Play,
  CheckCircle,
  HelpCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import {
  workflowFormSchema,
  type WorkflowFormValues,
} from '../schemas/workflow-form-schema';
import {
  TRIGGER_OPTIONS,
  TRIGGER_COMPATIBLE_FIELDS,
  TRIGGER_COMPATIBLE_ACTIONS,
  ACTION_OPTIONS,
  OPERATOR_LABELS,
  type Workflow,
  type WorkflowTriggerType,
  type WorkflowOperator,
  type WorkflowActionType,
} from '../types/workflow.types';

interface WorkflowBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WorkflowFormValues) => Promise<void> | void;
  initialData?: Workflow | null;
  isSaving?: boolean;
}

export function WorkflowBuilderModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving = false,
}: WorkflowBuilderModalProps) {
  const [showDiscardConfirm, setShowDiscardConfirm] = React.useState(false);
  const isSubmittingRef = React.useRef(false);

  const defaultValues: WorkflowFormValues = React.useMemo(() => {
    if (initialData) {
      return {
        name: initialData.name,
        description: initialData.description || '',
        status: initialData.status,
        trigger: {
          eventType: initialData.trigger.eventType,
        },
        conditions: initialData.conditions.map((c) => ({
          field: c.field,
          operator: c.operator,
          value: c.value,
        })),
        actions: initialData.actions.map((a) => ({
          type: a.type,
          params: a.params || {},
        })),
      };
    }

    // Default template: Smart Retry on Failed Transactions
    return {
      name: '',
      description: '',
      status: 'active',
      trigger: {
        eventType: 'transaction_failed',
      },
      conditions: [
        { field: 'retryCount', operator: 'lt', value: 3 },
      ],
      actions: [
        { type: 'auto_retry', params: { maxAttempts: 2, backoff: 'exponential' } },
      ],
    };
  }, [initialData]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Reset form when modal opens or initialData changes
  React.useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
      setShowDiscardConfirm(false);
      isSubmittingRef.current = false;
    }
  }, [isOpen, defaultValues, reset]);

  // Window beforeunload prompt when dirty
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isOpen && isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isOpen, isDirty]);

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control,
    name: 'conditions',
  });

  const {
    fields: actionFields,
    append: appendAction,
    remove: removeAction,
  } = useFieldArray({
    control,
    name: 'actions',
  });

  const selectedTrigger = watch('trigger.eventType');
  const compatibleFields = TRIGGER_COMPATIBLE_FIELDS[selectedTrigger] || [];
  const compatibleActions = TRIGGER_COMPATIBLE_ACTIONS[selectedTrigger] || [];

  const handleSafeClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    reset(defaultValues);
    onClose();
  };

  const onFormSubmit = async (data: WorkflowFormValues) => {
    if (isSubmittingRef.current || isSaving) return;
    try {
      isSubmittingRef.current = true;
      await onSave(data);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const addDefaultCondition = () => {
    const firstField = compatibleFields[0];
    if (firstField) {
      appendCondition({
        field: firstField.name,
        operator: firstField.supportedOperators[0] || 'eq',
        value: firstField.defaultValue ?? (firstField.options?.[0]?.value || ''),
      });
    } else {
      appendCondition({
        field: 'failureReason',
        operator: 'eq',
        value: 'network_timeout',
      });
    }
  };

  const addDefaultAction = () => {
    const firstAllowed = compatibleActions[0] || 'notify_slack';
    const opt = ACTION_OPTIONS.find((a) => a.value === firstAllowed);
    appendAction({
      type: firstAllowed,
      params: opt ? { ...opt.defaultParams } : {},
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={handleSafeClose}
        title={initialData ? 'Edit Automation Rule' : 'Create Automation Workflow'}
        description="Define deterministic event triggers, rule conditions, and automated remediation actions."
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* General Info */}
            <div className="space-y-4 rounded-lg border border-border/70 bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" /> General Configuration
                </h4>
                {/* Status Switch */}
                <div className="flex items-center gap-2">
                  <label htmlFor="workflow-status" className="text-xs font-medium text-muted-foreground cursor-pointer">
                    Rule Active
                  </label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Switch
                        id="workflow-status"
                        checked={field.value === 'active'}
                        onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'paused')}
                        label="Toggle workflow status"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="wf-name" className="text-xs font-medium text-foreground">
                    Workflow Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="wf-name"
                    placeholder="e.g. Smart Retry on Network Timeouts"
                    {...register('name')}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'wf-name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="wf-name-error" className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="wf-desc" className="text-xs font-medium text-foreground">
                    Description <span className="text-muted-foreground text-[10px]">(Optional, max 200 chars)</span>
                  </label>
                  <Input
                    id="wf-desc"
                    placeholder="Describe the operational purpose and expected remediation path..."
                    {...register('description')}
                    aria-invalid={!!errors.description}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">{errors.description.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Trigger Selection */}
            <div className="space-y-3 rounded-lg border border-border/70 bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" /> 1. Event Trigger
                </h4>
                <Badge variant="outline" className="text-[11px] font-mono">
                  Incoming Event
                </Badge>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="trigger-event-type" className="text-xs font-medium text-foreground">
                  Select Event Source <span className="text-destructive">*</span>
                </label>
                <Controller
                  control={control}
                  name="trigger.eventType"
                  render={({ field }) => (
                    <Select
                      id="trigger-event-type"
                      value={field.value}
                      onChange={(e) => {
                        const newTrigger = e.target.value as WorkflowTriggerType;
                        field.onChange(newTrigger);
                        // Reset conditions and actions to fit new trigger
                        const newFields = TRIGGER_COMPATIBLE_FIELDS[newTrigger] || [];
                        const firstF = newFields[0];
                        if (firstF) {
                          setValue('conditions', [
                            {
                              field: firstF.name,
                              operator: firstF.supportedOperators[0] || 'eq',
                              value: firstF.defaultValue ?? '',
                            },
                          ]);
                        }
                        const newActions = TRIGGER_COMPATIBLE_ACTIONS[newTrigger] || [];
                        const firstA = newActions[0];
                        if (firstA) {
                          const opt = ACTION_OPTIONS.find((a) => a.value === firstA);
                          setValue('actions', [
                            {
                              type: firstA,
                              params: opt ? { ...opt.defaultParams } : {},
                            },
                          ]);
                        }
                      }}
                      options={TRIGGER_OPTIONS.map((t) => ({
                        label: t.label,
                        value: t.value,
                      }))}
                    />
                  )}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {TRIGGER_OPTIONS.find((t) => t.value === selectedTrigger)?.description}
                </p>
              </div>
            </div>

            {/* Conditions Section */}
            <div className="space-y-3 rounded-lg border border-border/70 bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-amber-500" /> 2. Rule Conditions (IF)
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    All conditions must evaluate to true (AND logic) for actions to trigger.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDefaultCondition}
                  className="gap-1.5 text-xs h-7"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Condition
                </Button>
              </div>

              {errors.conditions?.message && (
                <p className="text-xs text-destructive">{errors.conditions.message}</p>
              )}

              <div className="space-y-2.5">
                {conditionFields.map((fieldItem, index) => {
                  const condField = watch(`conditions.${index}.field`);
                  const fieldDef = compatibleFields.find((f) => f.name === condField);
                  const allowedOps = fieldDef?.supportedOperators || ['eq', 'neq'];

                  return (
                    <div
                      key={fieldItem.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 rounded-md bg-muted/40 border border-border/60"
                    >
                      {/* Field Selection */}
                      <div className="w-full sm:w-1/3">
                        <label className="sr-only">Field</label>
                        <Controller
                          control={control}
                          name={`conditions.${index}.field`}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                const newDef = compatibleFields.find((f) => f.name === e.target.value);
                                if (newDef) {
                                  setValue(`conditions.${index}.operator`, newDef.supportedOperators[0] || 'eq');
                                  setValue(
                                    `conditions.${index}.value`,
                                    newDef.defaultValue ?? (newDef.options?.[0]?.value || '')
                                  );
                                }
                              }}
                              options={compatibleFields.map((f) => ({
                                label: f.label,
                                value: f.name,
                              }))}
                              aria-label={`Condition ${index + 1} field`}
                            />
                          )}
                        />
                      </div>

                      {/* Operator Selection */}
                      <div className="w-full sm:w-1/4">
                        <label className="sr-only">Operator</label>
                        <Controller
                          control={control}
                          name={`conditions.${index}.operator`}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onChange={field.onChange}
                              options={allowedOps.map((op) => ({
                                label: OPERATOR_LABELS[op] || op,
                                value: op,
                              }))}
                              aria-label={`Condition ${index + 1} operator`}
                            />
                          )}
                        />
                      </div>

                      {/* Value Input */}
                      <div className="w-full sm:flex-1">
                        <label className="sr-only">Value</label>
                        {fieldDef?.options ? (
                          <Controller
                            control={control}
                            name={`conditions.${index}.value`}
                            render={({ field }) => (
                              <Select
                                value={String(field.value)}
                                onChange={field.onChange}
                                options={fieldDef.options || []}
                                aria-label={`Condition ${index + 1} comparison value`}
                              />
                            )}
                          />
                        ) : (
                          <Input
                            placeholder={fieldDef?.type === 'number' ? 'e.g. 3' : 'Value'}
                            type={fieldDef?.type === 'number' ? 'number' : 'text'}
                            {...register(`conditions.${index}.value`)}
                            aria-label={`Condition ${index + 1} comparison value`}
                          />
                        )}
                        {errors.conditions?.[index]?.value && (
                          <p className="text-[11px] text-destructive mt-1">
                            {errors.conditions[index]?.value?.message}
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      {conditionFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(index)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                          aria-label={`Remove condition ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions Section */}
            <div className="space-y-3 rounded-lg border border-border/70 bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" /> 3. Automated Actions (THEN)
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Operations executed in sequence when all conditions match.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDefaultAction}
                  className="gap-1.5 text-xs h-7"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Action
                </Button>
              </div>

              {errors.actions?.message && (
                <p className="text-xs text-destructive">{errors.actions.message}</p>
              )}

              <div className="space-y-3">
                {actionFields.map((actionItem, index) => {
                  const actType = watch(`actions.${index}.type`);
                  const availableActions = ACTION_OPTIONS.filter((a) =>
                    compatibleActions.includes(a.value)
                  );

                  return (
                    <div
                      key={actionItem.id}
                      className="space-y-3 p-3 rounded-md bg-muted/40 border border-border/60"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <label className="sr-only">Action Type</label>
                          <Controller
                            control={control}
                            name={`actions.${index}.type`}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onChange={(e) => {
                                  const newType = e.target.value as WorkflowActionType;
                                  field.onChange(newType);
                                  const opt = ACTION_OPTIONS.find((a) => a.value === newType);
                                  setValue(
                                    `actions.${index}.params`,
                                    opt ? { ...opt.defaultParams } : {}
                                  );
                                }}
                                options={availableActions.map((a) => ({
                                  label: a.label,
                                  value: a.value,
                                }))}
                                aria-label={`Action ${index + 1} type`}
                              />
                            )}
                          />
                        </div>

                        {actionFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAction(index)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                            aria-label={`Remove action ${index + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Action Parameters Config */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/40 text-xs">
                        {actType === 'auto_retry' && (
                          <>
                            <div className="space-y-1">
                              <label className="font-medium text-foreground">
                                Max Retry Attempts (1-5)
                              </label>
                              <Input
                                type="number"
                                min={1}
                                max={5}
                                {...register(`actions.${index}.params.maxAttempts`, {
                                  valueAsNumber: true,
                                })}
                                placeholder="2"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-medium text-foreground">
                                Backoff Strategy
                              </label>
                              <Controller
                                control={control}
                                name={`actions.${index}.params.backoff`}
                                render={({ field }) => (
                                  <Select
                                    value={String(field.value || 'exponential')}
                                    onChange={field.onChange}
                                    options={[
                                      { label: 'Exponential Backoff', value: 'exponential' },
                                      { label: 'Linear Backoff', value: 'linear' },
                                      { label: 'Immediate Next Batch', value: 'immediate' },
                                    ]}
                                  />
                                )}
                              />
                            </div>
                          </>
                        )}

                        {actType === 'notify_slack' && (
                          <div className="sm:col-span-2 space-y-1">
                            <label className="font-medium text-foreground">
                              Target Slack Channel
                            </label>
                            <Input
                              placeholder="#ops-alerts"
                              {...register(`actions.${index}.params.channel`)}
                            />
                            {errors.actions?.[index]?.params && (
                              <p className="text-[11px] text-destructive">
                                Slack channel identifier is required.
                              </p>
                            )}
                          </div>
                        )}

                        {actType === 'create_ticket' && (
                          <>
                            <div className="space-y-1">
                              <label className="font-medium text-foreground">Queue Destination</label>
                              <Input
                                placeholder="Finance-Ops"
                                {...register(`actions.${index}.params.queue`)}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-medium text-foreground">Incident Priority</label>
                              <Controller
                                control={control}
                                name={`actions.${index}.params.priority`}
                                render={({ field }) => (
                                  <Select
                                    value={String(field.value || 'high')}
                                    onChange={field.onChange}
                                    options={[
                                      { label: 'Low', value: 'low' },
                                      { label: 'Medium', value: 'medium' },
                                      { label: 'High', value: 'high' },
                                      { label: 'Critical', value: 'critical' },
                                    ]}
                                  />
                                )}
                              />
                            </div>
                          </>
                        )}

                        {actType === 'freeze_account' && (
                          <div className="sm:col-span-2 space-y-1">
                            <label className="font-medium text-foreground">
                              Safety Freeze Hold Duration (Minutes)
                            </label>
                            <Input
                              type="number"
                              min={15}
                              max={1440}
                              placeholder="120"
                              {...register(`actions.${index}.params.durationMinutes`, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Incompatibility / Validation Summary Alert */}
            {Object.keys(errors).length > 0 && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Workflow configuration contains errors:</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {errors.name && <li>{errors.name.message}</li>}
                    {errors.conditions?.message && <li>{errors.conditions.message}</li>}
                    {errors.conditions &&
                      Array.isArray(errors.conditions) &&
                      errors.conditions.map((c, i) =>
                        c?.field || c?.value ? (
                          <li key={i}>
                            Condition #{i + 1}: {c.field?.message || c.value?.message}
                          </li>
                        ) : null
                      )}
                    {errors.actions?.message && <li>{errors.actions.message}</li>}
                    {errors.actions &&
                      Array.isArray(errors.actions) &&
                      errors.actions.map((a, i) =>
                        a?.type ? (
                          <li key={i}>
                            Action #{i + 1}: {a.type?.message}
                          </li>
                        ) : null
                      )}
                  </ul>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleSafeClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Saving...
                  </>
                ) : initialData ? (
                  'Update Workflow'
                ) : (
                  'Create Workflow'
                )}
              </Button>
            </div>
          </form>
      </Dialog>

      {/* Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <Dialog
          isOpen={showDiscardConfirm}
          onClose={() => setShowDiscardConfirm(false)}
          title="Discard Unsaved Changes?"
          description="You have unsaved changes in this workflow configuration. If you close now, your edits will be discarded."
          className="max-w-md"
        >
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDiscardConfirm(false)}
            >
              Continue Editing
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDiscard}
            >
              Discard & Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </>
  );
}
