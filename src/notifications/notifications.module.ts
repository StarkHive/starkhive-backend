import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationSettingsModule } from '@src/notification-settings/notification-settings.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobNotification } from './entities/job-notification.entities';
import { ConnectionNotification } from './entities/connection-notification.entity';

@Module({
  imports: [
    NotificationSettingsModule,
    TypeOrmModule.forFeature([JobNotification, ConnectionNotification]),
  ],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService], 
})
export class NotificationsModule {}
