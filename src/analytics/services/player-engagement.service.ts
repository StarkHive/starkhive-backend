import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerEngagement } from '../entities/player-engagement.entity';
import { PlayerEngagementDto } from '../dto/player-engagement.dto';

@Injectable()
export class PlayerEngagementService {
  constructor(
    @InjectRepository(PlayerEngagement)
    private engagementRepository: Repository<PlayerEngagement>,
  ) {}

  async recordEngagement(dto: PlayerEngagementDto): Promise<PlayerEngagement> {
    const engagement = this.engagementRepository.create(dto);
    return this.engagementRepository.save(engagement);
  }

  async getEngagementByPlayer(playerId: string): Promise<PlayerEngagement[]> {
    return this.engagementRepository.find({ where: { playerId } });
  }
}
