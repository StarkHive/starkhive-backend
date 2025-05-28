import { Controller, Get, Param } from '@nestjs/common';
import { PresenceService } from './presence.service';

@Controller('test')
export class TestController {
  constructor(private readonly presenceService: PresenceService) {}

  @Get('connect/:userId')
  async testConnect(@Param('userId') userId: string) {
    await this.presenceService.handleUserConnection(userId);
    return `Handled connection for user ${userId}`;
  }

  @Get('disconnect/:userId')
  async testDisconnect(@Param('userId') userId: string) {
    await this.presenceService.handleUserDisconnection(userId);
    return `Handled disconnection for user ${userId}`;
  }

  @Get('idle')
  async testIdle() {
    await this.presenceService.checkAndMarkIdleUsers();
    return 'Checked for idle users.';
  }
}
