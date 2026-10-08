import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './pagination';

describe('Pagination Component', () => {
  it('renders page info and navigation buttons', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalItems={100}
        pageSize={20}
        onPageChange={handlePageChange}
      />
    );

    expect(screen.getByText(/showing/i)).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /go to next page/i });
    expect(nextButton).not.toBeDisabled();
    fireEvent.click(nextButton);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button on page 1', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalItems={100}
        pageSize={20}
        onPageChange={vi.fn()}
      />
    );

    const prevButton = screen.getByRole('button', { name: /go to previous page/i });
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on the last page', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        totalItems={100}
        pageSize={20}
        onPageChange={vi.fn()}
      />
    );

    const nextButton = screen.getByRole('button', { name: /go to next page/i });
    expect(nextButton).toBeDisabled();
  });
});
