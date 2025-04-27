import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FreelancerProfile } from './entities/freelancer-profile.entity';
import { FreelancerProfileRepository } from './repositories/freelancer-profile.repository';
import { FreelancerProfileService } from './freelancer-profile.service';
import { FreelancerPortfolioProject } from './entities/freelancer-portfolio.entity';
import { Category } from './entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FreelancerProfile,
      FreelancerPortfolioProject,
      Category,
    ]),
  ],
  providers: [FreelancerProfileRepository, FreelancerProfileService],
  exports: [FreelancerProfileService],
})
export class FreelancerProfileModule {}
