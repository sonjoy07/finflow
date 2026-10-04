'use client';

import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CreditCard,
  Landmark,
  Wallet,
  Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import type { TransactionListItem } from '../types/transaction.types';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  data: TransactionListItem[];
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: React.Dispatch<React.SetStateAction<VisibilityState>>;
  rowSelection: RowSelectionState;
  onRowSelectionChange: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (column: 'createdAt' | 'amountCents' | 'status' | 'customerName') => void;
  onSelectTransaction: (id: string) => void;
  onPrefetchTransaction?: (id: string) => void;
}

function getPaymentMethodIcon(method: string) {
  switch (method) {
    case 'card':
      return <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />;
    case 'bank_transfer':
    case 'ach':
    case 'wire':
      return <Landmark className="h-3.5 w-3.5" aria-hidden="true" />;
    default:
      return <Wallet className="h-3.5 w-3.5" aria-hidden="true" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'settled':
      return <Badge variant="success" showDot>Settled</Badge>;
    case 'failed':
      return <Badge variant="destructive" showDot>Failed</Badge>;
    case 'pending':
      return <Badge variant="warning" showDot>Pending</Badge>;
    case 'refunded':
      return <Badge variant="purple" showDot>Refunded</Badge>;
    case 'disputed':
      return <Badge variant="purple" showDot>Disputed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getRiskBadge(score: number) {
  if (score < 25) {
    return <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{score}</span>;
  }
  if (score < 50) {
    return <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">{score}</span>;
  }
  return <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{score}</span>;
}

export function TransactionTable({
  data,
  columnVisibility,
  onColumnVisibilityChange,
  rowSelection,
  onRowSelectionChange,
  sortBy,
  sortOrder,
  onSortChange,
  onSelectTransaction,
  onPrefetchTransaction,
}: TransactionTableProps) {
  const columns = React.useMemo<ColumnDef<TransactionListItem>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label="Select all transactions"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select transaction ${row.original.id}`}
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'id',
      header: 'Transaction ID',
      cell: ({ row }) => {
        const txn = row.original;
        return (
          <div className="flex items-center gap-2 font-mono font-medium text-foreground">
            <span className="text-muted-foreground">{getPaymentMethodIcon(txn.paymentMethod)}</span>
            <span>{txn.id}</span>
          </div>
        );
      },
    },
    {
      id: 'customerName',
      accessorKey: 'customer.name',
      header: () => (
        <button
          type="button"
          onClick={() => onSortChange('customerName')}
          aria-label={
            sortBy === 'customerName'
              ? `Sort by Customer, currently sorted ${sortOrder === 'asc' ? 'ascending' : 'descending'}`
              : 'Sort by Customer'
          }
          className="inline-flex items-center gap-1 font-semibold hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
        >
          <span>Customer</span>
          {sortBy === 'customerName' ? (
            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-40" />
          )}
        </button>
      ),
      cell: ({ row }) => {
        const customer = row.original.customer;
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">{customer.name}</span>
              {customer.tier === 'enterprise' && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 uppercase font-mono">
                  Ent
                </Badge>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground">{customer.email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'amountCents',
      header: () => (
        <button
          type="button"
          onClick={() => onSortChange('amountCents')}
          aria-label={
            sortBy === 'amountCents'
              ? `Sort by Amount, currently sorted ${sortOrder === 'asc' ? 'ascending' : 'descending'}`
              : 'Sort by Amount'
          }
          className="inline-flex items-center gap-1 font-semibold hover:text-foreground ml-auto focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
        >
          <span>Amount</span>
          {sortBy === 'amountCents' ? (
            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-40" />
          )}
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-right font-mono font-semibold text-foreground tabular-nums">
          {formatCurrency(row.original.amountCents, row.original.currency)}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: () => (
        <button
          type="button"
          onClick={() => onSortChange('status')}
          aria-label={
            sortBy === 'status'
              ? `Sort by Status, currently sorted ${sortOrder === 'asc' ? 'ascending' : 'descending'}`
              : 'Sort by Status'
          }
          className="inline-flex items-center gap-1 font-semibold hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
        >
          <span>Status</span>
          {sortBy === 'status' ? (
            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-40" />
          )}
        </button>
      ),
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: 'riskScore',
      accessorKey: 'customer.riskScore',
      header: 'Risk Score',
      cell: ({ row }) => getRiskBadge(row.original.customer.riskScore),
    },
    {
      accessorKey: 'createdAt',
      header: () => (
        <button
          type="button"
          onClick={() => onSortChange('createdAt')}
          aria-label={
            sortBy === 'createdAt'
              ? `Sort by Date, currently sorted ${sortOrder === 'asc' ? 'ascending' : 'descending'}`
              : 'Sort by Date'
          }
          className="inline-flex items-center gap-1 font-semibold hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
        >
          <span>Date (UTC)</span>
          {sortBy === 'createdAt' ? (
            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-40" />
          )}
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelectTransaction(row.original.id);
            }}
            aria-label={`Inspect details for ${row.original.id}`}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ], [sortBy, sortOrder, onSortChange, onSelectTransaction]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <caption className="sr-only">
            FinFlow Transaction Explorer Table. Sortable by Amount, Status, Customer, and Date.
          </caption>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold"
              >
                {headerGroup.headers.map((header) => {
                  let ariaSort: 'ascending' | 'descending' | 'none' = 'none';
                  if (header.column.id === sortBy) {
                    ariaSort = sortOrder === 'asc' ? 'ascending' : 'descending';
                  }
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={header.column.getCanSort() ? ariaSort : undefined}
                      className={cn(
                        'px-4 py-3 select-none',
                        header.id === 'amountCents' && 'text-right',
                        header.id === 'select' && 'w-10 pr-0'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/40">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-32 text-center text-xs text-muted-foreground"
                >
                  No transactions found matching the selected criteria.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for transaction ${row.original.id}`}
                  onClick={() => onSelectTransaction(row.original.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectTransaction(row.original.id);
                    }
                  }}
                  onMouseEnter={() => onPrefetchTransaction?.(row.original.id)}
                  className={cn(
                    'hover:bg-muted/50 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                    row.getIsSelected() && 'bg-primary/5'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        'px-4 py-3',
                        cell.column.id === 'amountCents' && 'text-right',
                        cell.column.id === 'select' && 'pr-0'
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
