import {
  Controller,
  Get,
  Delete,
  Param,
  Request,
  UseGuards,
  Post,
} from '@nestjs/common';
import { UserSessionService } from './user-session.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class UserSessionController {
  constructor(private readonly sessionService: UserSessionService) {}

  @Get()
  async getActiveSessions(@Request() req: { user: { id: string } }) {
    return this.sessionService.getActiveSessions(req.user.id);
  }

  @Delete(':sessionId')
  async terminateSession(
    @Request() req: { user: { id: string } },
    @Param('sessionId') sessionId: string,
  ) {
    await this.sessionService.terminateSession(sessionId, req.user.id);
    return { message: 'Session terminated successfully' };
  }

  @Delete('terminate/others')
  async terminateOtherSessions(
    @Request() req: { user: { id: string; sessionId: string } },
  ) {
    await this.sessionService.terminateAllOtherSessions(
      req.user.id,
      req.user.sessionId,
    );
    return { message: 'Other sessions terminated successfully' };
  }

  @Post('refresh')
  async refreshSession(@Request() req: { body: any }) {
    const { refreshToken } = req.body;
    return this.sessionService.refreshSession(refreshToken);
  }
}
