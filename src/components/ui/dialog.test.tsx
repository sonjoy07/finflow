import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { Dialog } from './dialog';
import { Button } from './button';

describe('Accessible Dialog Primitive', () => {
  it('renders title, description, and children when isOpen is true', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={vi.fn()}
        title="Test Modal Title"
        description="Test modal accessible description."
      >
        <p>Modal inner content</p>
      </Dialog>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal Title')).toBeInTheDocument();
    expect(screen.getByText('Test modal accessible description.')).toBeInTheDocument();
    expect(screen.getByText('Modal inner content')).toBeInTheDocument();
  });

  it('does not render dialog in the DOM when isOpen is false', () => {
    render(
      <Dialog
        isOpen={false}
        onClose={vi.fn()}
        title="Test Modal Title"
      >
        <p>Modal inner content</p>
      </Dialog>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Modal Title')).not.toBeInTheDocument();
  });

  it('invokes onClose when the close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Content</p>
      </Dialog>
    );

    const closeBtn = screen.getByRole('button', { name: /close dialog/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('invokes onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Content</p>
      </Dialog>
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
