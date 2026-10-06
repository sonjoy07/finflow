import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExecutionDetailDrawer } from './execution-detail-drawer';
import type { WorkflowExecution } from '../types/workflow.types';

describe('ExecutionDetailDrawer', () => {
  const mockExecution: WorkflowExecution = {
    id: 'wfe_sim_999',
    workflowId: 'wf_1',
    workflowName: 'Smart Retry on Gateway Timeouts',
    triggerEntityId: 'txn_0042',
    triggerEntityType: 'transaction',
    status: 'success',
    durationMs: 145,
    stepLogs: [
      {
        stepNumber: 1,
        stepName: 'Evaluate Condition: failureReason eq network_timeout',
        status: 'success',
        outputMessage: 'Rule condition satisfied. Observed payload value: "network_timeout".',
      },
      {
        stepNumber: 2,
        stepName: 'Execute Action: AUTO RETRY',
        status: 'success',
        outputMessage: 'Dispatched smart retry simulation payload (max attempts: 2). Status: queued.',
      },
    ],
    executedAt: '2026-11-01T12:00:00.000Z',
  };

  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders execution drawer with header, simulation banner, and steps', () => {
    render(
      <ExecutionDetailDrawer
        execution={mockExecution}
        isOpen={true}
        onClose={onCloseMock}
      />
    );

    expect(screen.getByText('Workflow Execution Audit Log')).toBeInTheDocument();
    expect(screen.getByText(/Simulated Automation Run/i)).toBeInTheDocument();
    expect(screen.getByText('txn_0042')).toBeInTheDocument();
    expect(screen.getByText('145ms')).toBeInTheDocument();

    // Step logs
    expect(screen.getAllByText(/Evaluate Condition: failureReason eq network_timeout/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Rule condition satisfied\. Observed payload value/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Execute Action: AUTO RETRY/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Dispatched smart retry simulation payload/i).length).toBeGreaterThanOrEqual(1);
  });

  it('does not render when closed', () => {
    render(
      <ExecutionDetailDrawer
        execution={mockExecution}
        isOpen={false}
        onClose={onCloseMock}
      />
    );

    expect(screen.queryByText('Workflow Execution Audit Log')).not.toBeInTheDocument();
  });
});
