import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkflowBuilderModal } from './workflow-builder-modal';

describe('WorkflowBuilderModal', () => {
  const onSaveMock = vi.fn();
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the workflow builder modal when open', () => {
    render(
      <WorkflowBuilderModal
        isOpen={true}
        onClose={onCloseMock}
        onSave={onSaveMock}
      />
    );

    expect(screen.getByText('Create Automation Workflow')).toBeInTheDocument();
    expect(screen.getByLabelText(/Workflow Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select Event Source/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Rule Conditions \(IF\)/i)).toBeInTheDocument();
    expect(screen.getByText(/3. Automated Actions \(THEN\)/i)).toBeInTheDocument();
  });

  it('allows adding and removing dynamic conditions', async () => {
    const user = userEvent.setup();
    render(
      <WorkflowBuilderModal
        isOpen={true}
        onClose={onCloseMock}
        onSave={onSaveMock}
      />
    );

    const addConditionBtn = screen.getByRole('button', { name: /Add Condition/i });
    await user.click(addConditionBtn);

    // Now there should be multiple condition rows
    const removeConditionBtns = screen.getAllByRole('button', { name: /Remove condition/i });
    expect(removeConditionBtns.length).toBeGreaterThanOrEqual(1);

    // Remove a condition
    expect(removeConditionBtns[0]).toBeDefined();
    await user.click(removeConditionBtns[0]!);
  });

  it('allows adding and removing dynamic actions', async () => {
    const user = userEvent.setup();
    render(
      <WorkflowBuilderModal
        isOpen={true}
        onClose={onCloseMock}
        onSave={onSaveMock}
      />
    );

    const addActionBtn = screen.getByRole('button', { name: /Add Action/i });
    await user.click(addActionBtn);

    const removeActionBtns = screen.getAllByRole('button', { name: /Remove action/i });
    expect(removeActionBtns.length).toBeGreaterThanOrEqual(1);
  });

  it('displays validation error if submitted without a name', async () => {
    const user = userEvent.setup();
    render(
      <WorkflowBuilderModal
        isOpen={true}
        onClose={onCloseMock}
        onSave={onSaveMock}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Create Workflow/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Workflow name must be at least 3 characters/i).length).toBeGreaterThanOrEqual(1);
    });
    expect(onSaveMock).not.toHaveBeenCalled();
  });

  it('calls onSave when valid workflow data is submitted', async () => {
    const user = userEvent.setup();
    render(
      <WorkflowBuilderModal
        isOpen={true}
        onClose={onCloseMock}
        onSave={onSaveMock}
      />
    );

    const nameInput = screen.getByLabelText(/Workflow Name/i);
    await user.type(nameInput, 'Auto Retry Velocity Declines');

    const submitBtn = screen.getByRole('button', { name: /Create Workflow/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalledTimes(1);
    }, { timeout: 4000 });
    expect(onSaveMock.mock.calls[0]?.[0]?.name).toBe('Auto Retry Velocity Declines');
  });

  it('prompts confirmation modal before discarding unsaved edits', async () => {
    const user = userEvent.setup();
    render(
      <WorkflowBuilderModal
        isOpen={true}
        onClose={onCloseMock}
        onSave={onSaveMock}
      />
    );

    const nameInput = screen.getByLabelText(/Workflow Name/i);
    fireEvent.change(nameInput, { target: { value: 'Partial Unsaved Rule' } });

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelBtn);

    // Discard modal should appear
    await waitFor(() => {
      expect(screen.getByText(/Discard Unsaved Changes\?/i)).toBeInTheDocument();
    });
    expect(onCloseMock).not.toHaveBeenCalled();

    // Confirm discard
    const discardBtn = screen.getByRole('button', { name: /Discard & Close/i });
    await user.click(discardBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
