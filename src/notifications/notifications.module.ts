import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationProcessor } from './queue/notification.processor';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { WebhookStrategy } from './strategies/webhook.strategy';
import { EmailStrategy } from './strategies/email.strategy';
import { PushStrategy } from './strategies/push.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationPreference]),
    BullModule.registerQueue({
      name: 'notifications',
      defaultJobOptions: {
        removeOnComplete: true,
        attempts: 3,
      },
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationProcessor,
    WebhookStrategy,
    EmailStrategy,
    PushStrategy,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}