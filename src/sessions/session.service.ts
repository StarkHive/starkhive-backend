/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { User } from 'src/user/entities/user.entity';
import * as moment from 'moment';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async createSession(
    user: User,
    ipAddress: string,
    deviceInfo: string,
  ): Promise<Session> {
    const session = this.sessionRepository.create({
      user,
      ipAddress,
      deviceInfo,
      expiresAt: moment().add(1, 'hour').toDate(),
    });

    return this.sessionRepository.save(session);
  }

  async getUserSessions(userId: number): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { user: { id: userId } as any, isActive: true },
      relations: ['user'],
    });
  }
  async terminateSession(
    sessionId: number,
    userId: number,
  ): Promise<{ message: string }> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, user: { id: userId } as any },
      relations: ['user'],
    });

    if (!session) throw new NotFoundException('Session not found');

    session.isActive = false;
    await this.sessionRepository.save(session);
    return { message: 'Session terminated successfully' };
  }

  async terminateAllSessions(userId: number): Promise<{ message: string }> {
    await this.sessionRepository.update(
      { user: { id: userId } as any, isActive: true },
      { isActive: false },
    );
    return { message: 'All sessions terminated' };
  }

  async refreshSession(sessionId: number): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, isActive: true },
    });

    if (!session) throw new UnauthorizedException('Invalid session');

    session.expiresAt = moment().add(1, 'hour').toDate();
    return this.sessionRepository.save(session);
  }

  async autoExpireSessions(): Promise<void> {
    await this.sessionRepository.update(
      { expiresAt: moment().toDate() },
      { isActive: false },
    );
  }
}
