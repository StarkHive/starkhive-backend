import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';


@Module({
  imports: [PrometheusModule.register()],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
