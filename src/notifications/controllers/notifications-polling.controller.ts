import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import type { NotificationsService } from "../notifications.service"

/**
 * Polling fallback for browsers without SSE support
 */
@Controller("notifications")
export class NotificationsPollingController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get("poll")
  async pollNotifications(@Query('userId') userId: number, @Query('lastSeen') lastSeen?: string) {
    // Get notifications for the user, potentially filtering by timestamp
    // if lastSeen is provided
    if (!userId) {
      return { error: "User ID is required" }
    }

    const notifications = await this.notificationsService.findByUser(userId)

    // If lastSeen is provided, filter notifications to only return newer ones
    if (lastSeen) {
      const lastSeenDate = new Date(lastSeen)
      return notifications.filter((n) => new Date(n.createdAt) > lastSeenDate)
    }

    return notifications
  }
}

