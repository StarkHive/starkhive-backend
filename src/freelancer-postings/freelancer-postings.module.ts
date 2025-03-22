import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FreelancerPostingsService } from './freelancer-postings.service';
import { FreelancerPostingsController } from './freelancer-postings.controller';
import { FreelancerPosting } from './entities/freelancer-posting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FreelancerPosting])],
  controllers: [FreelancerPostingsController],
  providers: [FreelancerPostingsService],
  exports: [FreelancerPostingsService],
})
export class FreelancerPostingsModule {}
