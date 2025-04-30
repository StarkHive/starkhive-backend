import {
  Controller,
  Get,
  Query,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsSummary } from '../analytics/entities/analytics-summary.entity';
import { DailyAnalytics }   from './entities/daily-analytics.entity';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get analytics summary' })
  @ApiResponse({
    status: 200,
    description: 'Returns overall summary metrics',
    type: AnalyticsSummary,
  })
  async getSummary(): Promise<AnalyticsSummary> {
    this.logger.log('Fetching analytics summary');
    return this.analyticsService.getSummary();
  }

  @Get('daily')
  @ApiOperation({ summary: 'Get daily analytics' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns daily breakdown of metrics',
    type: [DailyAnalytics],
  })
  async getDailyAnalytics(
    @Query('startDate') startDateStr?: string,
    @Query('endDate')   endDateStr?: string,
  ): Promise<DailyAnalytics[]> {
    const endDate = endDateStr ? new Date(endDateStr) : new Date();
    const startDate = startDateStr
      ? new Date(startDateStr)
      : this.getDefaultStartDate();

    this.logger.log(
      `Fetching daily analytics from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );
    return this.analyticsService.getDailyAnalytics();
  }

  private getDefaultStartDate(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 30); // last 30 days
    return d;
  }
}
