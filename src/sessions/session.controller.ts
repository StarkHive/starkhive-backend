/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Delete,
  Req,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { AuthenticatedRequest } from 'src/common/authenticated-request.interface';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('sessions')
@UseGuards(JwtAuthGuard) // Protect all session routes
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  async getUserSessions(@Req() req: AuthenticatedRequest) {
    const userId = Number(req.user.id); // Convert string to number
    return this.sessionService.getUserSessions(userId);
  }

  @Delete(':sessionId')
  async terminateSession(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId', ParseIntPipe) sessionId: number, // Ensure sessionId is a number
  ) {
    const userId = Number(req.user.id); // Convert string to number
    return this.sessionService.terminateSession(sessionId, userId);
  }

  @Delete()
  async terminateAllSessions(@Req() req: AuthenticatedRequest) {
    const userId = Number(req.user.id); // Convert string to number
    return this.sessionService.terminateAllSessions(userId);
  }
}
