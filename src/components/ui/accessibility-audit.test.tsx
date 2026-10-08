import { describe, it, expect, vi, beforeAll } from 'vitest';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';
import * as React from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Input } from './input';
import { Dialog } from './dialog';
import { Drawer } from './drawer';
import { Pagination } from './pagination';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';

// Mock HTMLCanvasElement.prototype.getContext to silence JSDOM canvas warnings in axe-core
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn();
});

describe('Automated WCAG 2.1 AA Accessibility Audit (vitest-axe)', () => {
  it('verifies Button primitive in multiple variants has zero accessibility violations', async () => {
    const { container } = render(
      <div>
        <Button variant="primary">Confirm Action</Button>
        <Button variant="outline" disabled>Disabled State</Button>
        <Button variant="destructive" aria-label="Delete transaction">Delete</Button>
      </div>
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('verifies Badge primitive across semantic variants has zero violations', async () => {
    const { container } = render(
      <div>
        <Badge variant="success" showDot>Settled</Badge>
        <Badge variant="destructive" showDot>Failed</Badge>
        <Badge variant="warning" showDot>Pending</Badge>
      </div>
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('verifies Card and semantic content has zero violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Multi-rail gateway availability is at 99.98%.</p>
        </CardContent>
      </Card>
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('verifies Input with associated Label and error state has zero violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="test-input" className="text-sm font-medium">
          Idempotency Key
        </label>
        <Input
          id="test-input"
          aria-describedby="test-input-desc"
          placeholder="idem_test_123"
        />
        <p id="test-input-desc" className="text-xs text-muted-foreground">
          Must be unique per transaction request.
        </p>
      </div>
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('verifies accessible Dialog overlay has proper ARIA attributes and zero violations', async () => {
    const { container } = render(
      <Dialog
        isOpen={true}
        onClose={vi.fn()}
        title="Simulate Transaction Retry"
        description="Schedule immediate idempotent retry through the acquiring gateway."
      >
        <div>
          <label htmlFor="audit-note" className="text-sm">Audit Note</label>
          <Input id="audit-note" placeholder="Reason for retry..." />
        </div>
      </Dialog>
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('verifies accessible Drawer overlay has zero violations', async () => {
    const { container } = render(
      <Drawer
        isOpen={true}
        onClose={vi.fn()}
        title="Transaction Details"
        description="Raw ledger payload and settlement lifecycle history."
      >
        <div>
          <p>Transaction ID: txn_001</p>
        </div>
      </Drawer>
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('verifies Pagination control has accessible buttons and zero violations', async () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalItems={100}
        pageSize={20}
        onPageChange={vi.fn()}
      />
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('verifies EmptyState and ErrorState feedback components have zero violations', async () => {
    const { container } = render(
      <div>
        <EmptyState
          title="No transactions found"
          description="Try adjusting your filter criteria."
          actionLabel="Reset Filters"
          onAction={vi.fn()}
        />
        <ErrorState
          title="Network Error"
          message="Could not reach the acquiring network mock."
          onRetry={vi.fn()}
        />
      </div>
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
