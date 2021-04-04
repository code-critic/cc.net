import { NotificationManager } from 'react-notifications';

interface INotificationManager {
    info(msg: string, title?: string): void;
    success(msg: string, title?: string): void;
    warning(msg: string, title?: string): void;
    error(msg: string, title?: string): void;
}

export const notifications = NotificationManager as INotificationManager;