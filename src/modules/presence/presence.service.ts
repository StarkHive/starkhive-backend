import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@src/user/entities/user.entity';
import { PresenceStatus } from '@src/user/enums/presence-status.enum';

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private activeConnections: Map<string, number> = new Map();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id: userId });
  }

  async handleUserConnection(userId: string): Promise<void> {
    const count = this.activeConnections.get(userId) || 0;
    this.activeConnections.set(userId, count + 1);

    if (count === 0) {
      await this.updateUserStatus(userId, PresenceStatus.ONLINE);
    }

    await this.updateLastActivity(userId);
  }

  async handleUserDisconnection(userId: string): Promise<void> {
    const count = this.activeConnections.get(userId) || 1;
    this.activeConnections.set(userId, count - 1);

    if (count <= 1) {
      this.activeConnections.delete(userId);
      await this.updateUserStatus(userId, PresenceStatus.OFFLINE);
    }
  }

  async updateLastActivity(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastActivityAt: new Date(),
    });
  }

  async updateUserStatus(
    userId: string,
    status: PresenceStatus,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      resenceStatus: status,
    });
    this.logger.log(`User ${userId} status updated to ${status}`);
  }

  async checkAndMarkIdleUsers(): Promise<void> {
    const idleThreshold = new Date(Date.now() - 5 * 60 * 1000);
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.lastActivityAt < :idleThreshold', { idleThreshold })
      .andWhere('user.presenceStatus IN (:...statuses)', {
        statuses: [PresenceStatus.ONLINE, PresenceStatus.BUSY],
      })
      .getMany();

    for (const user of users) {
      await this.updateUserStatus(user.id, PresenceStatus.IDLE);
    }
  }
}
