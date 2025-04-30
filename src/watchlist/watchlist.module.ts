import { Module } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { WatchlistController } from './watchlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Watchlist } from './entities/watchlist.entity';
import { Recruiter } from '@src/recruiter/entities/recruiter.entity';
import { FreelancerProfile } from '@src/freelancer-profile/entities/freelancer-profile.entity';

@Module({
    imports: [
      TypeOrmModule.forFeature([
        Watchlist,
        Recruiter,
        FreelancerProfile
      ]),
    ],
  
  controllers: [WatchlistController],
  providers: [WatchlistService],
  exports: [WatchlistService],
})
export class WatchlistModule {}
