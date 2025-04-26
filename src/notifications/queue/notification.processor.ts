import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus } from '../entities/notification.entity';
import { WebhookStrategy } from '../strategies/webhook.strategy';
import { EmailStrategy } from '../strategies/email.strategy';
import { PushStrategy } from '../strategies/push.strategy';

@Injectable()
@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);
  private readonly strategies: Map<string, any>;

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private webhookStrategy: WebhookStrategy,
    private emailStrategy: EmailStrategy,
    private pushStrategy: PushStrategy,
  ) {
    this.strategies = new Map([
      ['webhook', webhookStrategy],
      ['email', emailStrategy],
      ['push', pushStrategy],
    ]);
  }

  @Process('send')
  async handleSend(job: Job<{ notificationId: string }>) {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: job.data.notificationId },
        relations: ['user'],
      });

      if (!notification) {
        throw new Error(`Notification ${job.data.notificationId} not found`);
      }

      const strategy = this.strategies.get(notification.deliveryChannel);
      if (!strategy) {
        throw new Error(`No strategy found for channel ${notification.deliveryChannel}`);
      }

      const success = await strategy.send(notification);

      if (success) {
        notification.status = NotificationStatus.DELIVERED;
      } else {
        notification.status = NotificationStatus.FAILED;
        notification.retryCount += 1;
      }

      await this.notificationRepository.save(notification);

      return success;
    } catch (error) {
      this.logger.error(`Failed to process notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('digest')
  async handleDigest(job: Job<{ userId: string; frequency: string }>) {
    try {
      const { userId, frequency } = job.data;

      // Find all pending notifications for the user with the specified digest frequency
      const notifications = await this.notificationRepository.find({
        where: {
          userId,
          status: NotificationStatus.PENDING,
          // Add additional conditions based on digest frequency
        },
        relations: ['user'],
      });

      // Group notifications by delivery channel
      const groupedNotifications = this.groupNotificationsByChannel(notifications);

      // Process each group
      for (const [channel, channelNotifications] of Object.entries(groupedNotifications)) {
        const strategy = this.strategies.get(channel);
        if (!strategy) continue;

        // Create a digest notification
        const digestNotification = this.createDigestNotification(channelNotifications);
        
        const success = await strategy.send(digestNotification);

        // Update status of all notifications in the digest
        await this.updateDigestNotificationsStatus(
          channelNotifications,
          success ? NotificationStatus.DELIVERED : NotificationStatus.FAILED
        );
      }
    } catch (error) {
      this.logger.error(`Failed to process digest: ${error.message}`, error.stack);
      throw error;
    }
  }

  private groupNotificationsByChannel(notifications: Notification[]): Record<string, Notification[]> {
    return notifications.reduce((acc, notification) => {
      const channel = notification.deliveryChannel;
      if (!acc[channel]) {
        acc[channel] = [];
      }
      acc[channel].push(notification);
      return acc;
    }, {} as Record<string, Notification[]>);
  }

  private createDigestNotification(notifications: Notification[]): Notification {
    const firstNotification = notifications[0];
    return {
      ...firstNotification,
      content: {
        digest: true,
        notifications: notifications.map(n => ({
          type: n.type,
          content: n.content,
          createdAt: n.createdAt,
        })),
      },
    } as Notification;
  }

  private async updateDigestNotificationsStatus(
    notifications: Notification[],
    status: NotificationStatus,
  ) {
    await this.notificationRepository.update(
      notifications.map(n => n.id),
      { status },
    );
  }
} 