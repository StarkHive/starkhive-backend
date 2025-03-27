import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { JobPosting } from '../job-postings/entities/job-posting.entity';
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';
import { Company } from '../company/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobPosting, FreelancerProfile, Company]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
