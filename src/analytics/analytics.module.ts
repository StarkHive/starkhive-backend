
// 32. Create AnalyticsModule (src/analytics/analytics.module.ts)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemMetric } from './entities/system-metric.entity';
import { AnalyticsController } from './analytical.controller';
import { AnalyticsService } from './analytic.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemMetric]),
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
