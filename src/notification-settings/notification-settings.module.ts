import { Module } from '@nestjs/common';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSettingsController } from './notification-settings.controller';

@Module({
  providers: [NotificationSettingsService],
  controllers: [NotificationSettingsController]
})
export class NotificationSettingsModule {}
