import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge Component', () => {
  it('renders badge text correctly', () => {
    render(<Badge>Settled</Badge>);
    expect(screen.getByText('Settled')).toBeInTheDocument();
  });

  it('renders status variants with correct classes', () => {
    const { rerender } = render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success').parentElement).toHaveClass('bg-emerald-500/10');

    rerender(<Badge variant="destructive">Failed</Badge>);
    expect(screen.getByText('Failed').parentElement).toHaveClass('bg-rose-500/10');
  });

  it('renders indicator dot when showDot is true', () => {
    const { container } = render(<Badge variant="warning" showDot>Pending</Badge>);
    const dot = container.querySelector('span[aria-hidden="true"]');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass('bg-amber-500');
  });
});
