/* eslint-disable prettier/prettier */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'src/sessions/session.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const activeSession = await this.sessionRepository.findOne({
      where: { user: { id: user.id }, isActive: true },
      order: { lastActiveAt: 'DESC' },
    });

    if (!activeSession || this.isSessionExpired(activeSession)) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    return true;
  }

  private isSessionExpired(session: Session): boolean {
    const timeout = 30 * 60 * 1000; // 30 minutes timeout
    return Date.now() - new Date(session.lastActiveAt).getTime() > timeout;
  }
}
