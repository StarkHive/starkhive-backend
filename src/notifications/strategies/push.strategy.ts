import { Injectable, Logger } from '@nestjs/common';
import { NotificationStrategy } from './notification-strategy.interface';
import { Notification } from '../entities/notification.entity';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class PushStrategy implements NotificationStrategy {
  private readonly logger = new Logger(PushStrategy.name);
  private readonly fcm: admin.messaging.Messaging;

  constructor(private configService: ConfigService) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get('FIREBASE_PROJECT_ID'),
          clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
          privateKey: this.configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
        }),
      });
    }
    this.fcm = admin.messaging();
  }

  async send(notification: Notification): Promise<boolean> {
    try {
      const preference = await notification.user.notificationPreferences.find(
        (pref) => pref.notificationType === notification.type
      );

      if (!preference?.channelConfig?.push?.deviceTokens?.length) {
        throw new Error('No device tokens configured for push notifications');
      }

      const { deviceTokens } = preference.channelConfig.push;

      const message: admin.messaging.MulticastMessage = {
        tokens: deviceTokens,
        notification: {
          title: notification.type,
          body: this.generateNotificationBody(notification),
        },
        data: {
          notificationId: notification.id,
          type: notification.type,
          content: JSON.stringify(notification.content),
        },
      };

      const response = await this.fcm.sendMulticast(message);
      
      if (response.failureCount > 0) {
        this.logger.warn(`Some push notifications failed: ${response.failureCount} failures`);
      }

      return response.successCount > 0;
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`, error.stack);
      return false;
    }
  }

  private generateNotificationBody(notification: Notification): string {
    // Create a simple text representation of the notification content
    // You can customize this based on the notification type and content
    switch (notification.type) {
      case 'job_match':
        return 'New job match found for you!';
      case 'message':
        return 'You have a new message';
      case 'endorsement':
        return 'Someone endorsed your skills';
      default:
        return 'New notification';
    }
  }
} 