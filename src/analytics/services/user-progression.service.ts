import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProgression } from '../entities/user-progress.entity';

@Injectable()
export class UserProgressionService {
  constructor(
    @InjectRepository(UserProgression)
    private progressionRepository: Repository<UserProgression>,
  ) {}

  async recordProgression(userId: string, level: number, progress: number): Promise<UserProgression> {
    const progression = this.progressionRepository.create({ userId, level, progress });
    return this.progressionRepository.save(progression);
  }

  async getProgression(userId: string): Promise<UserProgression[]> {
    return this.progressionRepository.find({ where: { userId } });
  }
}
