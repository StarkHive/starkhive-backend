/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Delete,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getSessions(@Request() req) {
    return this.sessionService.getUserSessions(req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async terminateSession(@Request() req, @Param('id') sessionId: number) {
    return this.sessionService.terminateSession(sessionId, req.user.id);
  }
}
