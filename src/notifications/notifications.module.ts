import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationSettingsModule } from '../notification-settings/notification-settings.module';

import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';

import { NotificationProcessor } from './queue/notification.processor';
import { WebhookStrategy } from './strategies/webhook.strategy';
import { EmailStrategy } from './strategies/email.strategy';
import { PushStrategy } from './strategies/push.strategy';
import { NotificationSettingsService } from '@src/notification-settings/notification-settings.service';
import { SseService } from '@src/sse/sse.service';
import { JobNotification } from './entities/job-notification.entities';

@Module({
  imports: [
    forwardRef(() => NotificationSettingsModule), // use forwardRef if circular
    TypeOrmModule.forFeature([
      Notification,
      NotificationPreference,
      JobNotification,
    ]),
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
    NotificationSettingsService,  // usually imported via NotificationSettingsModule, might be redundant here
    SseService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
