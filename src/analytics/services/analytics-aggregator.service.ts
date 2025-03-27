import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../analytic.service';

@Injectable()
export class AnalyticsAggregatorService {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async aggregateMetrics() {
    return this.analyticsService.getMetricsSummary();
  }
}
