import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyReportingService } from './policy-reporting.service';
import { PolicyReportingController } from './policy-reporting.controller';
import { PolicyViolation } from '../policy-violation/policy-violation.entity';
import { UserConsent } from '../user-censent/user-censent.entity';
import { Policy } from '../policy/policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyViolation, UserConsent, Policy])],
  controllers: [PolicyReportingController],
  providers: [PolicyReportingService],
  exports: [PolicyReportingService],
})
export class PolicyReportingModule {}
