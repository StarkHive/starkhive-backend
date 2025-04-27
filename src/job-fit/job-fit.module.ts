import { Module } from '@nestjs/common';
import { JobFitController } from './job-fit.controller';
import { JobFitService } from './job-fit.service';
import { JobFitCache } from './job-fit.cache';
import { RedisModule } from '../redis/redis.module';
import { FreelancerProfileModule } from '../freelancer-profile/freelancer-profile.module';
import { JobPostingsModule } from '../job-postings/job-postings.module';
import { EndorsementModule } from '../endorsement/endorsement.module';
import { ContractModule } from '../contract/contract.module';

@Module({
    imports: [
        RedisModule,
        FreelancerProfileModule,
        JobPostingsModule,
        EndorsementModule,
        ContractModule,
    ],
    controllers: [JobFitController],
    providers: [JobFitService, JobFitCache],
    exports: [JobFitService],
})
export class JobFitModule {}
