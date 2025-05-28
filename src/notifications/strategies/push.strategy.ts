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
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
      const rawPrivateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

      if (!projectId || !clientEmail || !rawPrivateKey) {
        throw new Error('Firebase config environment variables are missing');
      }

      // Replace escaped newlines in the private key string
      const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
    this.fcm = admin.messaging();
  }

  async send(notification: Notification): Promise<boolean> {
    try {
      const preference = await notification.user.notificationPreferences.find(
        (pref) => pref.notificationType === notification.type,
      );

      if (!preference?.channelConfig?.push?.deviceTokens?.length) {
        throw new Error('No device tokens configured for push notifications');
      }

      const { deviceTokens } = preference.channelConfig.push;

      const sendPromises = deviceTokens.map((token) =>
        this.fcm.send({
          token,
          notification: {
            title: notification.type,
            body: this.generateNotificationBody(notification),
          },
          data: {
            notificationId: notification.id,
            type: notification.type,
            content: JSON.stringify(notification.content),
          },
        }),
      );

      const results = await Promise.allSettled(sendPromises);

      const successCount = results.filter(
        (r) => r.status === 'fulfilled',
      ).length;

      if (successCount < deviceTokens.length) {
        this.logger.warn(
          `Some push notifications failed: ${deviceTokens.length - successCount} failures`,
        );
      }

      return successCount > 0;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to send push notification: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Unknown error occurred while sending push notification');
      }
      return false;
    }
  }

  private generateNotificationBody(notification: Notification): string {
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
