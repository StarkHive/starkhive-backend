import { Injectable, Logger } from '@nestjs/common';
import { NotificationStrategy } from './notification-strategy.interface';
import { Notification } from '../entities/notification.entity';
import axios from 'axios';

@Injectable()
export class WebhookStrategy implements NotificationStrategy {
  private readonly logger = new Logger(WebhookStrategy.name);

  async send(notification: Notification): Promise<boolean> {
    try {
      const preference = await notification.user.notificationPreferences.find(
        (pref) => pref.notificationType === notification.type
      );

      if (!preference?.channelConfig?.webhook?.url) {
        throw new Error('Webhook URL not configured');
      }

      const { url, headers = {} } = preference.channelConfig.webhook;

      await axios.post(url, {
        id: notification.id,
        type: notification.type,
        content: notification.content,
        timestamp: notification.createdAt,
      }, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to send webhook notification: ${error.message}`, error.stack);
      return false;
    }
  }
} 