import { Module } from '@nestjs/common';
import { EndorsementService } from './endorsement.service';
import { EndorsementController } from './endorsement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Endorsement } from './entities/endorsement.entity';
import { UserProfileModule } from '@src/user-profile/user-profile.module';
import { EndorsementRepository } from './repository/endorsement.repository';
import { EndorsementAnalyticsService } from './endorsement-analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Endorsement]), UserProfileModule],
  controllers: [EndorsementController],
  providers: [EndorsementService, EndorsementRepository, EndorsementAnalyticsService],
  exports: [EndorsementAnalyticsService, EndorsementService]
})
export class EndorsementModule {}
