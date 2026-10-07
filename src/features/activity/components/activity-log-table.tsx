'use client';

import * as React from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  Eye,
  AlertCircle,
  RefreshCw,
  Zap,
  Scale,
  GitBranch,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { formatDateTime } from '@/lib/formatters';
import { useActivityLogs } from '../hooks/use-activity-logs';
import { ActivityDetailModal } from './activity-detail-modal';
import type { ActivityLog, ActivityAction, ActivityEntityType, ActivityResult } from '../types/activity.types';

export function ActivityLogTable() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [actionFilter, setActionFilter] = React.useState('all');
  const [entityTypeFilter, setEntityTypeFilter] = React.useState('all');
  const [resultFilter, setResultFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [selectedActivity, setSelectedActivity] = React.useState<ActivityLog | null>(null);

  // Debounce search input (300ms)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useActivityLogs({
    page,
    pageSize,
    q: debouncedSearch,
    role: roleFilter,
    action: actionFilter,
    entityType: entityTypeFilter,
    result: resultFilter,
  });

  const logs: ActivityLog[] = data?.data || [];
  const meta = data?.meta || { page: 1, pageSize, totalItems: 0, totalPages: 1 };

  const resetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setRoleFilter('all');
    setActionFilter('all');
    setEntityTypeFilter('all');
    setResultFilter('all');
    setPage(1);
  };

  const hasActiveFilters =
    debouncedSearch.length > 0 ||
    roleFilter !== 'all' ||
    actionFilter !== 'all' ||
    entityTypeFilter !== 'all' ||
    resultFilter !== 'all';

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'TRANSACTION_RETRY':
        return <Zap className="h-3.5 w-3.5 text-primary" aria-hidden="true" />;
      case 'RECONCILIATION_RESOLVE':
        return <Scale className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />;
      case 'DISCREPANCY_FLAGGED':
        return <AlertTriangle className="h-3.5 w-3.5 text-rose-500" aria-hidden="true" />;
      case 'EXPORT_DATA':
        return <Download className="h-3.5 w-3.5 text-purple-500" aria-hidden="true" />;
      case 'WORKFLOW_TRIGGERED':
      case 'WORKFLOW_CREATE':
      case 'WORKFLOW_UPDATE':
      default:
        return <GitBranch className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />;
    }
  };

  const getResultBadge = (result?: ActivityResult) => {
    switch (result) {
      case 'failed':
        return <Badge variant="destructive" className="text-[10px] py-0 px-1.5 uppercase">Failed</Badge>;
      case 'flagged':
        return <Badge variant="warning" className="text-[10px] py-0 px-1.5 uppercase">Flagged</Badge>;
      case 'warning':
        return <Badge variant="warning" className="text-[10px] py-0 px-1.5 uppercase">Warning</Badge>;
      case 'success':
      default:
        return <Badge variant="success" className="text-[10px] py-0 px-1.5 uppercase">Success</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Synthetic Disclaimer Banner */}
        <div
          role="note"
          className="rounded-xl bg-card border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-foreground">Synthetic Audit & Compliance Feed</p>
              <p className="text-muted-foreground text-[11px]">
                Deterministic simulation audit records tracking operators, automated rules, and reconciliation actions. Zero sensitive PAN credentials stored.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-[10px] uppercase shrink-0 self-start sm:self-center">
            Simulated Audit Ledger
          </Badge>
        </div>

        {/* Filter Toolbar */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search Box */}
              <div className="relative lg:col-span-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search actor, entity, note..."
                  className="pl-8 text-xs h-9"
                  aria-label="Search activity logs"
                />
              </div>

              {/* Action Filter */}
              <Select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs h-9"
                aria-label="Filter by action"
                options={[
                  { label: 'All Actions', value: 'all' },
                  { label: 'Transaction Retry', value: 'TRANSACTION_RETRY' },
                  { label: 'Reconciliation Resolve', value: 'RECONCILIATION_RESOLVE' },
                  { label: 'Discrepancy Flagged', value: 'DISCREPANCY_FLAGGED' },
                  { label: 'Workflow Triggered', value: 'WORKFLOW_TRIGGERED' },
                  { label: 'Workflow Create', value: 'WORKFLOW_CREATE' },
                  { label: 'Workflow Update', value: 'WORKFLOW_UPDATE' },
                  { label: 'Export Data', value: 'EXPORT_DATA' },
                ]}
              />

              {/* Entity Type Filter */}
              <Select
                value={entityTypeFilter}
                onChange={(e) => {
                  setEntityTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs h-9"
                aria-label="Filter by entity type"
                options={[
                  { label: 'All Entities', value: 'all' },
                  { label: 'Transaction', value: 'transaction' },
                  { label: 'Reconciliation', value: 'reconciliation' },
                  { label: 'Workflow', value: 'workflow' },
                  { label: 'Export', value: 'export' },
                ]}
              />

              {/* Actor Role Filter */}
              <Select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs h-9"
                aria-label="Filter by operator role"
                options={[
                  { label: 'All Operator Roles', value: 'all' },
                  { label: 'Admin', value: 'admin' },
                  { label: 'Operations Lead', value: 'operations_lead' },
                  { label: 'Analyst', value: 'analyst' },
                  { label: 'Auditor', value: 'auditor' },
                ]}
              />

              {/* Result Filter */}
              <Select
                value={resultFilter}
                onChange={(e) => {
                  setResultFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs h-9"
                aria-label="Filter by result"
                options={[
                  { label: 'All Results', value: 'all' },
                  { label: 'Success', value: 'success' },
                  { label: 'Failed', value: 'failed' },
                  { label: 'Flagged', value: 'flagged' },
                  { label: 'Warning', value: 'warning' },
                ]}
              />
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                <span className="text-muted-foreground text-[11px]">
                  Showing filtered audit records
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-6 text-xs text-primary hover:underline px-1.5"
                >
                  Reset all filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Audit Event Log</CardTitle>
                <CardDescription className="text-xs">
                  {meta.totalItems} immutable simulated events recorded.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading && (
              <div className="p-4 space-y-3" aria-label="Loading activity logs">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            )}

            {isError && (
              <div className="p-8 text-center space-y-3">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto" aria-hidden="true" />
                <p className="text-xs font-semibold text-destructive">
                  {error instanceof Error ? error.message : 'Failed to fetch audit log records.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="gap-1.5 text-xs mx-auto"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retry</span>
                </Button>
              </div>
            )}

            {!isLoading && !isError && logs.length === 0 && (
              <div className="p-12 text-center space-y-3">
                <p className="text-sm font-semibold text-foreground">No audit events found</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {hasActiveFilters
                    ? 'No activity logs match the configured filter criteria.'
                    : 'No system activity logs currently recorded.'}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs">
                    Clear Filters
                  </Button>
                )}
              </div>
            )}

            {!isLoading && !isError && logs.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" role="table">
                  <caption className="sr-only">
                    FinFlow Operator Activity and Audit Trail Table. Filterable by Role, Action, and Entity.
                  </caption>
                  <thead className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                    <tr>
                      <th scope="col" className="px-4 py-3">Timestamp (UTC)</th>
                      <th scope="col" className="px-4 py-3">Actor / Operator</th>
                      <th scope="col" className="px-4 py-3">Action</th>
                      <th scope="col" className="px-4 py-3">Target Entity</th>
                      <th scope="col" className="px-4 py-3">Result</th>
                      <th scope="col" className="px-4 py-3">Description</th>
                      <th scope="col" className="px-4 py-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        tabIndex={0}
                        role="button"
                        aria-label={`View audit details for event ${log.id}`}
                        className="hover:bg-muted/30 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                        onClick={() => setSelectedActivity(log)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedActivity(log);
                          }
                        }}
                      >
                        <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                          {formatDateTime(log.timestamp)}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{log.actorName}</span>
                            <span className="text-[10px] text-muted-foreground capitalize font-mono">
                              {log.actorRole.replace('_', ' ')}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {getActionIcon(log.action)}
                            <span className="font-semibold text-foreground text-[11px]">
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[9px] py-0 px-1 uppercase">
                              {log.entityType}
                            </Badge>
                            <span className="text-foreground">{log.entityId}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {getResultBadge(log.result)}
                        </td>

                        <td className="px-4 py-3 max-w-xs text-muted-foreground truncate text-[11px]">
                          {log.description}
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedActivity(log);
                            }}
                            className="h-7 w-7 p-0"
                            aria-label={`Inspect event ${log.id}`}
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && !isError && meta.totalPages > 1 && (
              <div className="p-4 border-t border-border">
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  totalItems={meta.totalItems}
                  pageSize={meta.pageSize}
                  onPageChange={(newPage) => setPage(newPage)}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setPage(1);
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Inspection Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
      />
    </>
  );
}
