export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}

export type NotificationFilter = 'all' | 'unread' | 'warning' | 'error' | 'info' | 'success';
