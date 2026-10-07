import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { NotificationDrawer } from './notification-drawer';
import type { NotificationItem } from '../types/notification.types';

const mockNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Discrepancy Detected',
    message: 'Settlement batch has 2 amount mismatches totaling -$15.00.',
    severity: 'warning',
    read: false,
    linkUrl: '/reconciliation',
    createdAt: '2026-11-01T13:30:00.000Z',
  },
  {
    id: 'notif_2',
    title: 'Card Velocity Spike',
    message: 'Velocity limits exceeded on Acquiring Gateway Alpha.',
    severity: 'error',
    read: false,
    linkUrl: '/transactions?status=failed',
    createdAt: '2026-11-01T12:15:00.000Z',
  },
  {
    id: 'notif_3',
    title: 'Batch Balanced',
    message: 'ACH batch cleared with zero discrepancies.',
    severity: 'info',
    read: true,
    linkUrl: '/reconciliation',
    createdAt: '2026-11-01T08:00:00.000Z',
  },
];

const mockMarkRead = vi.fn();
const mockMarkAllRead = vi.fn();
let activeNotifications = [...mockNotifications];

vi.mock('../hooks/use-notifications', () => ({
  useNotifications: (options: { unreadOnly?: boolean; severity?: string } = {}) => {
    let list = [...activeNotifications];
    if (options.unreadOnly) {
      list = list.filter((n) => !n.read);
    }
    if (options.severity && options.severity !== 'all') {
      list = list.filter((n) => n.severity === options.severity);
    }
    return {
      data: list,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
  },
  useMarkNotificationAsRead: () => ({
    mutate: mockMarkRead,
    isPending: false,
  }),
  useMarkAllNotificationsAsRead: () => ({
    mutate: mockMarkAllRead,
    isPending: false,
  }),
}));

describe('NotificationDrawer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    activeNotifications = [...mockNotifications];
  });

  it('renders notification items with title, message, and severity', () => {
    render(<NotificationDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Operational Notifications')).toBeInTheDocument();
    expect(screen.getByText('Discrepancy Detected')).toBeInTheDocument();
    expect(screen.getByText('Card Velocity Spike')).toBeInTheDocument();
    expect(screen.getByText('Batch Balanced')).toBeInTheDocument();
    expect(screen.getByText(/Settlement batch has 2 amount mismatches/)).toBeInTheDocument();
  });

  it('filters notifications when selecting unread filter pill', () => {
    render(<NotificationDrawer isOpen={true} onClose={vi.fn()} />);

    const unreadTab = screen.getByRole('tab', { name: /unread/i });
    fireEvent.click(unreadTab);

    expect(screen.getByText('Discrepancy Detected')).toBeInTheDocument();
    expect(screen.getByText('Card Velocity Spike')).toBeInTheDocument();
    expect(screen.queryByText('Batch Balanced')).not.toBeInTheDocument();
  });

  it('calls markRead mutation when clicking mark as read button on unread item', () => {
    render(<NotificationDrawer isOpen={true} onClose={vi.fn()} />);

    const markReadButtons = screen.getAllByRole('button', { name: /mark notification as read/i });
    expect(markReadButtons.length).toBe(2);

    fireEvent.click(markReadButtons[0]!);
    expect(mockMarkRead).toHaveBeenCalledWith('notif_1');
  });

  it('calls markAllRead mutation when clicking Mark all read button', () => {
    render(<NotificationDrawer isOpen={true} onClose={vi.fn()} />);

    const markAllBtn = screen.getByRole('button', { name: /mark all read/i });
    expect(markAllBtn).toBeEnabled();

    fireEvent.click(markAllBtn);
    expect(mockMarkAllRead).toHaveBeenCalled();
  });

  it('renders empty state when there are no notifications matching the filter', () => {
    activeNotifications = [];
    render(<NotificationDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });
});
