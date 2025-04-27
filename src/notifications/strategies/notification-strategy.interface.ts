import { Notification } from '../entities/notification.entity';

export interface NotificationStrategy {
  send(notification: Notification): Promise<boolean>;
} 