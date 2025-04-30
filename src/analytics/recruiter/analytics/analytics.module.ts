import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Analytics } from './entities/analytics.entity'; // Correct path to the entity

// Optional: Comment these if the modules/entities don't yet exist
// import { JobsModule } from '../jobs/jobs.module';
// import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Analytics]),
    // JobsModule,
    // ApplicationsModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
