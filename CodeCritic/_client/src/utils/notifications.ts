import { NotificationManager } from 'react-notifications';

interface INotificationManager {
    info(msg: string, title?: string, duration?: number): void;
    success(msg: string, title?: string, duration?: number): void;
    warning(msg: string, title?: string, duration?: number): void;
    error(msg: string, title?: string, duration?: number): void;
}

export const notifications = NotificationManager as INotificationManager;