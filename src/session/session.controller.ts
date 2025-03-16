import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('sessions')
@UseGuards(JwtAuthGuard) // Protect all routes with JWT authentication
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * Get all active sessions for the authenticated user.
   */
  @Get('active')
  async getActiveSessions(@Req() req: Request) {
    const userId = req.user['id'];
    return this.sessionService.getActiveSessions(userId);
  }

  /**
   * Terminate a specific session (logout from one device).
   */
  @Delete(':sessionId')
  async terminateSession(@Param('sessionId') sessionId: string, @Req() req: Request) {
    const userId = req.user['id'];
    return this.sessionService.terminateSession(sessionId, userId);
  }

  /**
   * Terminate all active sessions for the authenticated user (logout from all devices).
   */
  @Delete('all')
  async terminateAllSessions(@Req() req: Request) {
    const userId = req.user['id'];
    await this.sessionService.terminateAllSessions(userId);
    return { message: 'All sessions terminated successfully' };
  }
}
