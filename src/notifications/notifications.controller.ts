import { Controller, Post, Body, Get, Query, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationPreferenceDto } from './dto/notification-preference.dto';
import { TriggerNotificationDto } from './dto/trigger-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { NotificationStatus } from './entities/notification.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Post('preferences')
    async updatePreferences(
        @Req() req: any,
        @Body() dto: UpdateNotificationPreferenceDto,
    ) {
        return this.notificationsService.updatePreferences(req.user.id, dto);
    }

    @Post('trigger')
    @UseGuards(RolesGuard)
    @Roles('admin')
    async triggerNotification(@Body() dto: TriggerNotificationDto) {
        return this.notificationsService.triggerNotification(dto);
    }

    @Get()
    async getNotifications(
        @Req() req: any,
        @Query('status') status?: NotificationStatus,
    ) {
        return this.notificationsService.getNotifications(req.user.id, status);
    }

    @Get('preferences')
    async getPreferences(@Req() req: any) {
        return this.notificationsService.getPreferences(req.user.id);
    }
}
