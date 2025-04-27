import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationSettingsModule } from '../notification-settings/notification-settings.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobNotification } from './entities/job-notification.entities';
import { PolicyVersionModule } from '../policy-version/policy-version.module';
import { ConnectionNotification } from './entities/connection-notification.entity';

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
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