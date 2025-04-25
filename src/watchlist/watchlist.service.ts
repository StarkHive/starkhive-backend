import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watchlist } from './entities/watchlist.entity';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';
import { Recruiter } from '@src/recruiter/entities/recruiter.entity';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(Watchlist)
    private readonly watchlistRepository: Repository<Watchlist>,
    @InjectRepository(Recruiter)
    private readonly recruiterRepository: Repository<Recruiter>,
    @InjectRepository(FreelancerProfile)
    private readonly freelancerRepository: Repository<FreelancerProfile>,
  ) {}

  async addToWatchlist(data: CreateWatchlistDto): Promise<Watchlist> {
    const { recruiterId, freelancerId, tags } = data;

    // Validate recruiter and freelancer exist
    const recruiter = await this.recruiterRepository.findOne({
      where: { id: recruiterId },
    });
    const freelancer = await this.freelancerRepository.findOne({
      where: { id: freelancerId },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter not found');
    }

    if (!freelancer) {
      throw new NotFoundException('Recruiter or Freelancer not found');
    }

    const recruiterWatchlistCount = await this.watchlistRepository.count({
      where: { recruiter: {id: recruiterId} },
    });
    if (recruiterWatchlistCount >= 50) {
      throw new BadRequestException(
        'Recruiter cannot have more than 50 watchlist entries',
      );
    }

    const watchlistEntry = this.watchlistRepository.create({
      recruiter,
      freelancer,
      tags,
    });

    return await this.watchlistRepository.save(watchlistEntry);
  }

  async getWatchlist(recruiterId: string): Promise<Watchlist[]> {
    const recruiter = await this.recruiterRepository.findOne({where:{id: recruiterId}});
    if (!recruiter) {
      throw new NotFoundException('Recruiter not found');
    }

    return await this.watchlistRepository.find({
      where: { recruiter: {id: recruiterId}, isActive: true },
    });
  }

  async removeFromWatchlist(freelancerId: string): Promise<void> {
    const watchlistEntry = await this.watchlistRepository.findOne({
      where: { freelancer: { id: freelancerId }, isActive: true },
    });

    if (!watchlistEntry) {
      throw new NotFoundException('Watchlist entry not found');
    }

    watchlistEntry.isActive = false;
    await this.watchlistRepository.save(watchlistEntry);
  }
}
