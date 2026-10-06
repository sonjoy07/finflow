import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExecutionHistoryTable } from './execution-history-table';
import type { WorkflowExecution, Workflow } from '../types/workflow.types';

describe('ExecutionHistoryTable', () => {
  const mockExecutions: WorkflowExecution[] = [
    {
      id: 'wfe_101',
      workflowId: 'wf_1',
      workflowName: 'Auto Retry Gateway Timeouts',
      triggerEntityId: 'txn_0042',
      triggerEntityType: 'transaction',
      status: 'success',
      durationMs: 145,
      stepLogs: [
        { stepNumber: 1, stepName: 'Evaluate Condition', status: 'success', outputMessage: 'Condition matched.' },
      ],
      executedAt: '2026-11-01T12:00:00.000Z',
    },
    {
      id: 'wfe_102',
      workflowId: 'wf_2',
      workflowName: 'High Discrepancy Escalation',
      triggerEntityId: 'rec_0008',
      triggerEntityType: 'reconciliation_record',
      status: 'skipped',
      durationMs: 45,
      stepLogs: [
        { stepNumber: 1, stepName: 'Evaluate Condition', status: 'failed', outputMessage: 'Condition not met.' },
      ],
      executedAt: '2026-11-01T11:00:00.000Z',
    },
  ];

  const mockWorkflows: Workflow[] = [];

  const onPageChangeMock = vi.fn();
  const onWorkflowFilterChangeMock = vi.fn();
  const onStatusFilterChangeMock = vi.fn();
  const onSelectExecutionMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders execution rows and simulation disclaimer banner', () => {
    render(
      <ExecutionHistoryTable
        executions={mockExecutions}
        workflows={mockWorkflows}
        totalItems={2}
        page={1}
        pageSize={25}
        onPageChange={onPageChangeMock}
        onWorkflowFilterChange={onWorkflowFilterChangeMock}
        onStatusFilterChange={onStatusFilterChangeMock}
        onSelectExecution={onSelectExecutionMock}
      />
    );

    // Simulation banner
    expect(screen.getByText(/Simulated Execution Audit Log/i)).toBeInTheDocument();

    // Execution rows
    expect(screen.getByText('wfe_101')).toBeInTheDocument();
    expect(screen.getByText('Auto Retry Gateway Timeouts')).toBeInTheDocument();
    expect(screen.getByText('txn_0042')).toBeInTheDocument();
    expect(screen.getByText('145ms')).toBeInTheDocument();

    expect(screen.getByText('wfe_102')).toBeInTheDocument();
    expect(screen.getByText('High Discrepancy Escalation')).toBeInTheDocument();
  });

  it('triggers onSelectExecution when clicking Logs button', async () => {
    const user = userEvent.setup();
    render(
      <ExecutionHistoryTable
        executions={mockExecutions}
        workflows={mockWorkflows}
        totalItems={2}
        page={1}
        pageSize={25}
        onPageChange={onPageChangeMock}
        onWorkflowFilterChange={onWorkflowFilterChangeMock}
        onStatusFilterChange={onStatusFilterChangeMock}
        onSelectExecution={onSelectExecutionMock}
      />
    );

    const logButtons = screen.getAllByRole('button', { name: /Inspect logs/i });
    expect(logButtons[0]).toBeDefined();
    await user.click(logButtons[0]!);

    expect(onSelectExecutionMock).toHaveBeenCalledWith(mockExecutions[0]);
  });

  it('renders empty state when there are no executions', () => {
    render(
      <ExecutionHistoryTable
        executions={[]}
        workflows={mockWorkflows}
        totalItems={0}
        page={1}
        pageSize={25}
        onPageChange={onPageChangeMock}
        onWorkflowFilterChange={onWorkflowFilterChangeMock}
        onStatusFilterChange={onStatusFilterChangeMock}
        onSelectExecution={onSelectExecutionMock}
      />
    );

    expect(screen.getByText(/No Executions Recorded/i)).toBeInTheDocument();
  });
});
