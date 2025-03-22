
// 35. Create AnalyticsController (src/analytics/analytics.controller.ts)
import { Controller, Get, Post, Body, Query, UseGuards, ParseEnumPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { AdminGuard } from '../auth/guards/admin.guard';
import { CreateMetricDto } from './dto/create-metric.dto';
import { AnalyticsService } from './analytic.service';
import { MetricType } from './enums/metric-types.enum';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('metrics')
  @UseGuards(JwtAuthGuard)
  recordMetric(@Body() createMetricDto: CreateMetricDto) {
    return this.analyticsService.recordMetric(createMetricDto);
  }

  @Get('metrics')
//   @UseGuards(JwtAuthGuard, AdminGuard)
  getMetricsByType(
    @Query('type', new ParseEnumPipe(MetricType)) type: MetricType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getMetricsByType(
      type,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('summary')
//   @UseGuards(JwtAuthGuard, AdminGuard)
  getMetricsSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getMetricsSummary(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('daily')
//   @UseGuards(JwtAuthGuard, AdminGuard)
  getDailyMetrics(
    @Query('type', new ParseEnumPipe(MetricType)) type: MetricType,
    @Query('days') days = 30,
  ) {
    return this.analyticsService.getDailyMetrics(type, +days);
  }
}