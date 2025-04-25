import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Referral } from './referral.entity';
import { ReferralMilestone } from './referral-milestone.entity';
import { ReferralService } from './referral.service';
import { ReferralController } from './referral.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Referral, ReferralMilestone])],
    providers: [ReferralService],
    controllers: [ReferralController],
})
export class ReferralModule {}
