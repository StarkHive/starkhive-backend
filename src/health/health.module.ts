import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule,
    AnalyticsModule,
  ],
  providers: [HealthService],
  controllers: [HealthController],
})
export class HealthModule {}
