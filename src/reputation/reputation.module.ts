import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReputationController } from './reputation.controller';
import { ReputationService } from './provider/reputation.service';
import { Reputation } from './Reputation.entity';
import { EndorsementModule } from '@src/endorsement/endorsement.module';
import { RatingsService } from '@src/rating/rating.service';
import { ProjectService } from '@src/project/project.service';
import { ProjectModule } from '@src/project/project.module';
import { RatingsModule } from '@src/rating/rating.module';

@Module({
  imports: [ProjectModule, EndorsementModule, RatingsModule, TypeOrmModule.forFeature([Reputation])], 
  controllers: [ReputationController],
  providers: [ReputationService],
  exports: [TypeOrmModule, ReputationService], // Export for use in other modules
})
export class ReputationModule {}
