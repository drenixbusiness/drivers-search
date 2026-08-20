export type NotificationLevel = 'info' | 'success' | 'warning';

export interface AppNotification {
    /** Stable across requests, so the read/unread state survives a refresh. */
    id: string;
    level: NotificationLevel;
    title: string;
    description: string;
    createdAt: string;
}

export interface NotificationsResponse {
    notifications: AppNotification[];
}
