import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemMetric } from './entities/system-metric.entity';
import { AnalyticsService } from './analytic.service';
import { AnalyticsController } from './analytical.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SystemMetric])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
