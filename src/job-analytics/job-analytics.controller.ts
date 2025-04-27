import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JobAnalyticsService } from './job-analytics.service';
import { AnalyticsEventType, JobAnalytic } from './entities/job-analytic.entity';
import {
  CreateAnalyticsEventDto,
  JobAnalyticsQueryDto,
  TopJobsQueryDto,
  DailyMetricsQueryDto,
} from './dto/create-job-analytic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('job-analytics')
export class JobAnalyticsController {
  constructor(private readonly jobAnalyticsService: JobAnalyticsService,
    @InjectRepository(JobAnalytic)
    private readonly analyticsRepository: Repository<JobAnalytic>
    ) {}

  @Post('track')
  async trackEvent(@Body() eventData: CreateAnalyticsEventDto, @Req() request: Request) {
    // Automatically capture user agent and IP address from the request
    if (!eventData.userAgent) {
      eventData.userAgent = request.headers['user-agent'] || '';
    }
    
    if (!eventData.ipAddress) {
      eventData.ipAddress = request.ip || '';
    }
    
    if (!eventData.referrer) {
      eventData.referrer = request.headers['referer'] || '';
    }
    
    await this.jobAnalyticsService.trackEvent(eventData);
    
    return { success: true, message: 'Event tracked successfully' };
  }

@Get('views/:jobId')
async getJobViewCount(@Param('jobId', ParseIntPipe) jobId: number, @Query() query: JobAnalyticsQueryDto) {
  try {
    // Parse date range if provided
    const dateRange = this.parseDateRange(query);
    
    // Use direct SQL query for reliable results
    const connection = this.analyticsRepository.manager.connection;
    
    // Build the query based on whether date range is provided
    let queryStr = `SELECT COUNT(*) as count FROM job_analytic WHERE "jobPostingId" = $1 AND "eventType" = 'view'`;
    const params = [jobId];
    
    if (dateRange) {
      queryStr += ` AND "createdAt" BETWEEN $2 AND $3`;
      params.push(dateRange.startDate, dateRange.endDate);
    }
    
    // Execute the SQL query
    const result = await connection.query(queryStr, params);
    const count = parseInt(result[0]?.count || '0', 10);
    
    return { jobId, viewCount: count };
  } catch (error) {
    return { jobId, viewCount: 0 };
  }
}

  @Get('applications/:jobId')
  async getJobApplicationCount(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Query() query: JobAnalyticsQueryDto,
  ) {
    const dateRange = this.parseDateRange(query);
    const applicationCount = await this.jobAnalyticsService.getJobApplicationCount(jobId, dateRange);
    
    return { jobId, applicationCount };
  }

  @Get('engagement/:jobId')
  async getJobEngagementMetrics(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Query() query: JobAnalyticsQueryDto,
  ) {
    const dateRange = this.parseDateRange(query);
    const metrics = await this.jobAnalyticsService.getJobEngagementMetrics(jobId, dateRange);
    
    return { jobId, ...metrics };
  }

  @Get('top-jobs')
  async getTopPerformingJobs(@Query() query: TopJobsQueryDto) {
    const { limit = 10, eventType = AnalyticsEventType.VIEW } = query;
    const dateRange = this.parseDateRange(query);
    
    const topJobs = await this.jobAnalyticsService.getTopPerformingJobs(
      limit,
      eventType,
      dateRange,
    );
    
    return { topJobs };
  }

  @Get('daily-metrics')
  async getDailyMetrics(@Query() query: DailyMetricsQueryDto) {
    const { jobId, eventType, startDate, endDate } = query;
    
    const dateRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };
    
    const metrics = await this.jobAnalyticsService.getDailyMetrics(jobId, eventType, dateRange);
    
    return { jobId, eventType, metrics };
  }

  @Get('dashboard/:jobId')
  async getJobAnalyticsDashboard(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Query() query: JobAnalyticsQueryDto,
  ) {
    const dateRange = this.parseDateRange(query);
    const dashboard = await this.jobAnalyticsService.getJobAnalyticsDashboard(jobId, dateRange);
    
    return dashboard;
  }

  @Get('test')
  async testAnalytics() {
    // Create a basic test event with integer job ID
    const testEvent = {
      jobPostingId: 1, // Using integer job ID
      eventType: AnalyticsEventType.VIEW,
      userId: 999,
      userAgent: 'Test Agent',
    };
    
    try {
      // Try to track the event
      await this.jobAnalyticsService.trackEvent(testEvent);
      
      // Get some test metrics
      const viewCount = await this.jobAnalyticsService.getJobViewCount(1);
      
      return {
        success: true,
        message: 'Test analytics endpoint working!',
        viewCount,
        testEvent,
      };
    } catch (error:any) {
      return {
        success: false,
        message: 'Test endpoint error',
        error: error.message,
        stack: error.stack,
      };
    }
  }

  /**
   * Helper method to parse date range from query parameters
   */
  private parseDateRange(query: JobAnalyticsQueryDto | TopJobsQueryDto): any {
    const { startDate, endDate } = query;
    
    if (startDate && endDate) {
      return {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
    }
    
    return undefined;
  }
}