/* eslint-disable prettier/prettier */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionService } from '../sessions/session.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private sessionService: SessionService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.headers['session-id'];

    if (!sessionId) throw new UnauthorizedException('Session ID missing');

    const session = await this.sessionService.getUserSessions(request.user.id);
    if (!session.some((s) => s.id === +sessionId && s.isActive)) {
      throw new UnauthorizedException('Invalid session');
    }

    return true;
  }
}
