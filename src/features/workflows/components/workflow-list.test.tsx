import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkflowList } from './workflow-list';
import type { Workflow } from '../types/workflow.types';

describe('WorkflowList', () => {
  const mockWorkflows: Workflow[] = [
    {
      id: 'wf_test_1',
      name: 'Smart Retry Gateway Timeouts',
      description: 'Auto retry network timeouts for enterprise customers.',
      status: 'active',
      trigger: { eventType: 'transaction_failed' },
      conditions: [{ field: 'failureReason', operator: 'eq', value: 'network_timeout' }],
      actions: [{ type: 'auto_retry', params: { maxAttempts: 2 } }],
      executionCount: 42,
      lastExecutedAt: '2026-11-01T12:00:00.000Z',
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    },
    {
      id: 'wf_test_2',
      name: 'High Discrepancy Escalation',
      description: 'Create Jira ticket when reconciliation variance exceeds $500.',
      status: 'paused',
      trigger: { eventType: 'reconciliation_mismatch' },
      conditions: [{ field: 'discrepancyDeltaCents', operator: 'gt', value: 50000 }],
      actions: [{ type: 'create_ticket', params: { queue: 'Ops' } }],
      executionCount: 12,
      lastExecutedAt: null,
      createdAt: '2026-10-05T00:00:00.000Z',
      updatedAt: '2026-10-05T00:00:00.000Z',
    },
  ];

  const onEditMock = vi.fn();
  const onDeleteMock = vi.fn();
  const onToggleStatusMock = vi.fn();
  const onSimulateRunMock = vi.fn();
  const onViewExecutionsMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all workflow cards with their metadata', () => {
    render(
      <WorkflowList
        workflows={mockWorkflows}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
        onToggleStatus={onToggleStatusMock}
        onSimulateRun={onSimulateRunMock}
        onViewExecutions={onViewExecutionsMock}
      />
    );

    expect(screen.getByText('Smart Retry Gateway Timeouts')).toBeInTheDocument();
    expect(screen.getByText('High Discrepancy Escalation')).toBeInTheDocument();
    expect(screen.getAllByText('Transaction Failed').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Reconciliation Mismatch').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('triggers onToggleStatus when switch is clicked', async () => {
    const user = userEvent.setup();
    render(
      <WorkflowList
        workflows={mockWorkflows}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
        onToggleStatus={onToggleStatusMock}
        onSimulateRun={onSimulateRunMock}
        onViewExecutions={onViewExecutionsMock}
      />
    );

    const toggleBtns = screen.getAllByRole('switch');
    expect(toggleBtns[0]).toBeDefined();
    await user.click(toggleBtns[0]!);

    expect(onToggleStatusMock).toHaveBeenCalledWith('wf_test_1', 'active');
  });

  it('triggers onSimulateRun when clicking Simulate Run', async () => {
    const user = userEvent.setup();
    render(
      <WorkflowList
        workflows={mockWorkflows}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
        onToggleStatus={onToggleStatusMock}
        onSimulateRun={onSimulateRunMock}
        onViewExecutions={onViewExecutionsMock}
      />
    );

    const simulateBtns = screen.getAllByRole('button', { name: /Simulate Run/i });
    expect(simulateBtns[0]).toBeDefined();
    await user.click(simulateBtns[0]!);

    expect(onSimulateRunMock).toHaveBeenCalledWith('wf_test_1');
  });

  it('triggers onEdit when clicking the edit button', async () => {
    const user = userEvent.setup();
    render(
      <WorkflowList
        workflows={mockWorkflows}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
        onToggleStatus={onToggleStatusMock}
        onSimulateRun={onSimulateRunMock}
        onViewExecutions={onViewExecutionsMock}
      />
    );

    const editBtn = screen.getByRole('button', { name: /Edit Smart Retry Gateway Timeouts/i });
    await user.click(editBtn);

    expect(onEditMock).toHaveBeenCalledWith(mockWorkflows[0]);
  });

  it('filters workflows when typing in the search box', async () => {
    const user = userEvent.setup();
    render(
      <WorkflowList
        workflows={mockWorkflows}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
        onToggleStatus={onToggleStatusMock}
        onSimulateRun={onSimulateRunMock}
        onViewExecutions={onViewExecutionsMock}
      />
    );

    const searchInput = screen.getByLabelText(/Search workflows/i);
    await user.type(searchInput, 'Discrepancy');

    expect(screen.queryByText('Smart Retry Gateway Timeouts')).not.toBeInTheDocument();
    expect(screen.getByText('High Discrepancy Escalation')).toBeInTheDocument();
  });
});
