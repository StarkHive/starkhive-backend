import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytic.service';

@Controller('analytics/details')
export class AnalyticsDetailsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  getAnalyticsDetails() {
    return { message: 'Detailed analytics endpoint' };
  }
}
