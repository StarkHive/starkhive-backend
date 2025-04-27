import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { NotificationSettingsService } from './notification-settings.service';
import { UpdateNotificationSettingsDto } from './dto/updateNotificationSettings.dto';
import { CacheService } from "@src/cache/cache.service";


@Controller('notification-settings')
export class NotificationSettingsController {
    /**injecting notification setting controller */
  constructor(private readonly notificationSettingsService: NotificationSettingsService, private cacheManager: CacheService) {}

  @Get(':userId')
  public async getNotificationSettings(@Param('userId') userId: number) {
    const cachedNotificationSettings = await this.cacheManager.get(`notification-settings:${userId}`, 'NotificationSettingsService');
    if (cachedNotificationSettings) {
      return cachedNotificationSettings;
    }

    const notificationSettings = await this.notificationSettingsService.getSettings(userId);
    await this.cacheManager.set(`notification-settings:${userId}`, notificationSettings);
    return notificationSettings;
  }

  @Patch(':userId')
  public async updateNotificationSettings(@Param('userId') userId: number, @Body() updateDto: UpdateNotificationSettingsDto) {
    await this.cacheManager.del(`notification-settings:${userId}`);
    return this.notificationSettingsService.updateSettings(userId, updateDto);
  }
}
