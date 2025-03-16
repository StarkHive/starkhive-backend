/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './session.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async getUserSessions(userId: number) {
    return this.sessionRepository.find({
      where: { user: { id: userId } as any, isActive: true },
    });
  }

  async terminateSession(sessionId: number, userId: number) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, user: { id: userId } as any },
    });

    if (!session) throw new NotFoundException('Session not found');

    session.isActive = false;
    await this.sessionRepository.save(session);
    return { message: 'Session terminated successfully' };
  }
}
