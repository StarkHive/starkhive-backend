import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserSession } from './entities/user-session.entity';
import { User } from '@src/user/entities/user.entity';

@Injectable()
export class UserSessionService {
  constructor(
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
    private jwtService: JwtService,
  ) {}

  async createSession(
    user: User,
    ipAddress: string,
    userAgent: string,
  ): Promise<UserSession> {
    const session = this.sessionRepository.create({
      user,
      userId: user.id,
      ipAddress,
      userAgent,
      deviceType: this.detectDeviceType(userAgent),
      lastActivity: new Date(),
      isActive: true,
      expiresAt: this.calculateExpirationTime(),
    });

    return this.sessionRepository.save(session);
  }

  async getActiveSessions(userId: string): Promise<UserSession[]> {
    return this.sessionRepository.find({
      where: {
        userId,
        isActive: true,
      },
      order: {
        lastActivity: 'DESC',
      },
    });
  }

  async terminateSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    session.isActive = false;
    await this.sessionRepository.save(session);
  }

  async terminateAllOtherSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<void> {
    await this.sessionRepository
      .createQueryBuilder()
      .update(UserSession)
      .set({ isActive: false })
      .where('userId = :userId', { userId })
      .andWhere('id != :currentSessionId', { currentSessionId })
      .execute();
  }

  private detectDeviceType(userAgent: string): string {
    // Basic device type detection
    if (userAgent.includes('Mobile')) return 'mobile';
    if (userAgent.includes('Tablet')) return 'tablet';
    return 'desktop';
  }

  private calculateExpirationTime(hours: number = 24): Date {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + hours);
    return expirationDate;
  }

  async refreshSession(
    refreshToken: string,
  ): Promise<{ accessToken: string; session: UserSession }> {
    try {
      // Verify refresh token
      const decoded = this.jwtService.verify(refreshToken);

      // Find active session
      const session = await this.sessionRepository.findOne({
        where: {
          id: decoded.sessionId,
          isActive: true,
        },
        relations: ['user'],
      });

      if (!session) {
        throw new UnauthorizedException('Invalid session');
      }

      // Generate new access token
      const accessToken = this.jwtService.sign({
        sub: session.userId,
        sessionId: session.id,
      });

      // Update last activity
      session.lastActivity = new Date();
      await this.sessionRepository.save(session);

      return { accessToken, session };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Session refresh failed');
    }
  }
}
