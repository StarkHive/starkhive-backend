import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationService: NotificationsService) {}

    /** Get all notifications for a user */
    @Get(':userId')
    public async getJobNotification(@Param('userId') userId: number) {
        return await this.notificationService.findByUser(userId);
    }

    /** Create a new notification */
    @Post('send')
    public async sendNotification(@Body() createNotificationDto: CreateNotificationDto) {
        return await this.notificationService.create(createNotificationDto);
    }

    /** Mark a notification as read */
    @Patch(':id')
    public async markAsRead(@Param('id') id: number, @Body() updateNotificationDto: UpdateNotificationDto) {
        return await this.notificationService.markAsRead(id, updateNotificationDto.read ?? true);
    }
}
