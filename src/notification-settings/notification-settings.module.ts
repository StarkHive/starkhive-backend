import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSettings } from './entities/notification-settings.entity';
import { NotificationSettingsService } from './notification-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationSettings])],
  providers: [NotificationSettingsService],
  exports: [NotificationSettingsService, TypeOrmModule],
})
export class NotificationSettingsModule {}
