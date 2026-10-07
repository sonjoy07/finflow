'use client';

import * as React from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Send,
  MoreVertical,
  Activity,
  Layers,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Drawer } from '@/components/ui/drawer';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { formatCurrency, formatPercentageDelta } from '@/lib/formatters';

export default function DesignSystemShowcasePage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isLoadingButton, setIsLoadingButton] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const [searchValue, setSearchValue] = React.useState('');

  const triggerLoading = () => {
    setIsLoadingButton(true);
    setTimeout(() => setIsLoadingButton(false), 2000);
  };

  return (
    <div className="space-y-10 pb-12">
      <PageHeader
        title="Design System & UI Primitives"
        description="Comprehensive enterprise fintech design tokens, accessible components, and visual identity standards for FinFlow."
        badge={<Badge variant="default">WCAG 2.1 AA</Badge>}
        breadcrumbs={[
          { label: 'FinFlow', href: '/' },
          { label: 'Design System' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(true)}>
              <Layers className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Preview Drawer
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsDialogOpen(true)}>
              <CreditCard className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Open Test Dialog
            </Button>
          </div>
        }
      />

      {/* 1. Typography & Metric KPI Cards */}
      <section aria-labelledby="kpi-tokens" className="space-y-4">
        <h2 id="kpi-tokens" className="text-lg font-semibold tracking-tight text-foreground">
          1. Fintech KPI Metric Cards
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="uppercase tracking-wider font-medium text-[11px]">
                Total Gross Volume (24h)
              </CardDescription>
              <CardTitle className="text-2xl font-bold font-mono tracking-tight">
                {formatCurrency(124508000, 'USD')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="success" showDot>
                  {formatPercentageDelta(8.4)}
                </Badge>
                <span className="text-muted-foreground">vs previous 24h</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="uppercase tracking-wider font-medium text-[11px]">
                Authorization Success Rate
              </CardDescription>
              <CardTitle className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                96.82%
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="success" showDot>
                  +1.20%
                </Badge>
                <span className="text-muted-foreground">benchmark 95.0%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="uppercase tracking-wider font-medium text-[11px]">
                Failed Transactions (Exceptions)
              </CardDescription>
              <CardTitle className="text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400">
                142
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="destructive" showDot>
                  -4.50%
                </Badge>
                <span className="text-muted-foreground">requires triage</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="uppercase tracking-wider font-medium text-[11px]">
                Unreconciled Discrepancy
              </CardDescription>
              <CardTitle className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
                {formatCurrency(184500, 'USD')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="warning" showDot>
                  3 Batches
                </Badge>
                <span className="text-muted-foreground">pending bank sync</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2. Buttons & Interactivity */}
      <section aria-labelledby="button-tokens" className="space-y-4">
        <h2 id="button-tokens" className="text-lg font-semibold tracking-tight text-foreground">
          2. Buttons & States
        </h2>
        <Card>
          <CardContent className="space-y-4 pt-5">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Button</Button>
              <Button
                variant="primary"
                isLoading={isLoadingButton}
                onClick={triggerLoading}
              >
                Click to Simulate Loading
              </Button>
              <Button variant="outline" disabled>
                Disabled
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button size="sm" variant="primary">
                Small (sm)
              </Button>
              <Button size="md" variant="primary">
                Medium (md)
              </Button>
              <Button size="lg" variant="primary">
                Large (lg)
              </Button>
              <Tooltip content="Quick export action" side="top">
                <Button size="icon" variant="outline" aria-label="Quick export">
                  <Download className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <span>Actions Menu</span>
                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="left">
                  <DropdownMenuItem onClick={() => alert('Simulated Retry')}>
                    <Send className="h-3.5 w-3.5 mr-2" aria-hidden="true" />
                    Simulate Retry
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => alert('Export CSV')}>
                    <Download className="h-3.5 w-3.5 mr-2" aria-hidden="true" />
                    Export Records
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => alert('Flagged as High Risk')} className="text-rose-500">
                    <AlertTriangle className="h-3.5 w-3.5 mr-2" aria-hidden="true" />
                    Flag as High Risk
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Badges & Semantic Status Tokens */}
      <section aria-labelledby="badge-tokens" className="space-y-4">
        <h2 id="badge-tokens" className="text-lg font-semibold tracking-tight text-foreground">
          3. Semantic Status Badges
        </h2>
        <Card>
          <CardContent className="flex flex-wrap gap-3 pt-5">
            <Badge variant="success" showDot>
              Settled (Authorized)
            </Badge>
            <Badge variant="warning" showDot>
              Pending Processing
            </Badge>
            <Badge variant="destructive" showDot>
              Failed (Declined)
            </Badge>
            <Badge variant="purple" showDot>
              Refunded / Disputed
            </Badge>
            <Badge variant="info" showDot>
              Reconciled Match
            </Badge>
            <Badge variant="secondary">Standard Secondary</Badge>
            <Badge variant="outline">Outline Token</Badge>
          </CardContent>
        </Card>
      </section>

      {/* 4. Form Controls */}
      <section aria-labelledby="form-tokens" className="space-y-4">
        <h2 id="form-tokens" className="text-lg font-semibold tracking-tight text-foreground">
          4. Form Inputs & Filters
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="search-input" className="text-xs font-medium text-foreground">
              Search Transactions
            </label>
            <Input
              id="search-input"
              placeholder="Search by ID, customer name..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              startIcon={<Search className="h-4 w-4" aria-hidden="true" />}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="filter-status" className="text-xs font-medium text-foreground">
              Filter by Status
            </label>
            <Select id="filter-status">
              <option value="all">All Statuses</option>
              <option value="settled">Settled</option>
              <option value="failed">Failed</option>
              <option value="processing">Processing</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="error-input" className="text-xs font-medium text-destructive">
              Input with Validation Error
            </label>
            <Input
              id="error-input"
              defaultValue="invalid-currency-format"
              isError
              aria-describedby="input-error-msg"
            />
            <p id="input-error-msg" className="text-[11px] text-destructive">
              Amount must be a valid integer in minor units (cents).
            </p>
          </div>
        </div>
      </section>

      {/* 5. Pagination */}
      <section aria-labelledby="pagination-tokens" className="space-y-4">
        <h2 id="pagination-tokens" className="text-lg font-semibold tracking-tight text-foreground">
          5. Accessible Table Pagination
        </h2>
        <Card>
          <CardContent className="pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={12}
              totalItems={284}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </CardContent>
        </Card>
      </section>

      {/* 6. Feedback & Empty / Error States */}
      <section aria-labelledby="feedback-tokens" className="space-y-4">
        <h2 id="feedback-tokens" className="text-lg font-semibold tracking-tight text-foreground">
          6. Feedback & Edge States
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <EmptyState
            title="No Matching Transactions"
            description="No transaction records match the active filters. Try expanding your date range or clearing filters."
            actionLabel="Reset Search Filters"
            onAction={() => setSearchValue('')}
          />

          <ErrorState
            title="Gateway Gateway Timeout"
            message="Acquiring bank cluster simulation did not respond within the 250ms SLA. Please retry the request."
            onRetry={() => alert('Retried request')}
          />
        </div>
      </section>

      {/* 7. Skeleton Pulse Loaders */}
      <section aria-labelledby="skeleton-tokens" className="space-y-4">
        <h2 id="skeleton-tokens" className="text-lg font-semibold tracking-tight text-foreground">
          7. Loading Skeletons
        </h2>
        <Card>
          <CardContent className="space-y-3 pt-5">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      </section>

      {/* Dialog Preview */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Simulate Transaction Retry"
        description="Verify idempotency parameters before submitting retry request to the mock gateway."
      >
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
            <span className="text-[11px] uppercase text-muted-foreground font-semibold">
              Transaction ID
            </span>
            <p className="font-mono text-sm font-semibold text-foreground">txn_01HZ89K2P001</p>
            <p className="text-xs text-muted-foreground">Original Decline: insufficient_funds</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="retry-notes" className="text-xs font-medium text-foreground">
              Operator Notes
            </label>
            <Input id="retry-notes" placeholder="e.g. Card re-authorization confirmed by client" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setIsDialogOpen(false);
              alert('Retry simulation submitted!');
            }}
          >
            Confirm & Execute Retry
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Drawer Preview */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Transaction Details"
        description="Full metadata and gateway timeline inspection."
      >
        <div className="space-y-5 text-sm">
          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Status</span>
              <Badge variant="destructive" showDot>
                Failed
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Amount</span>
              <span className="font-mono font-bold">{formatCurrency(24999, 'USD')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Customer</span>
              <span>Jane Cooper (Enterprise)</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">
              Audit Timeline
            </h4>
            <ul className="space-y-2 text-xs border-l border-border pl-3 ml-1">
              <li className="relative">
                <span className="font-medium text-foreground">Payment Attempted</span>
                <p className="text-muted-foreground text-[11px]">2026-11-01 10:14:22 UTC</p>
              </li>
              <li className="relative">
                <span className="font-medium text-destructive">Decline: Insufficient Funds</span>
                <p className="text-muted-foreground text-[11px]">2026-11-01 10:14:23 UTC</p>
              </li>
            </ul>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
