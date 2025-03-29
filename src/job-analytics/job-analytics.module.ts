import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobAnalyticsController } from './job-analytics.controller';
import { JobAnalyticsService } from './job-analytics.service';
import { JobPostingsModule } from 'src/job-postings/job-postings.module';
import { JobAnalytic } from './entities/job-analytic.entity';
import { JobAnalyticsRepository } from './repositories/job-analytics.repository';
import { CacheModule } from 'src/cache/cache.module';
import { JobAnalyticsGateway } from './real-time/job-analytics-gateway';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobAnalytic]),
    JobPostingsModule,
    CacheModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [JobAnalyticsController],
  providers: [JobAnalyticsService, JobAnalyticsRepository, JobAnalyticsGateway],
  exports: [JobAnalyticsService],
})
export class JobAnalyticsModule {}