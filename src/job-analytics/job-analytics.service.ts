import { Injectable, NotFoundException } from '@nestjs/common';
import { JobAnalyticsRepository } from './repositories/job-analytics.repository';
import { JobPostingsService } from 'src/job-postings/job-postings.service';
import { AnalyticsEventType } from './entities/job-analytic.entity';
import { CacheService } from 'src/cache/cache.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IJobAnalyticsService,
  CreateAnalyticsEventDto,
  DateRangeDto,
  JobEngagementMetricsDto,
  TopPerformingJobDto,
  JobAnalyticsDashboardDto,
  DailyMetricsDto,
} from './interfaces/job-analytics.interface';
import { Between } from 'typeorm';

@Injectable()
export class JobAnalyticsService implements IJobAnalyticsService {
  constructor(
    private readonly analyticsRepository: JobAnalyticsRepository,
    private readonly jobPostingsService: JobPostingsService,
    private readonly cacheManager: CacheService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Track a new analytics event
   */
  async trackEvent(eventData: CreateAnalyticsEventDto): Promise<void> {
    try {
      // Check if the job exists
      const job = await this.jobPostingsService.findOne(eventData.jobPostingId);
      
      // Track the event in the database
      await this.analyticsRepository.trackEvent(eventData);
      
      // Clear any cached analytics for this job
      await this.clearAnalyticsCache(eventData.jobPostingId);
      
      // Emit event for real-time updates
      this.eventEmitter.emit('job.analytics', {
        jobId: eventData.jobPostingId,
        eventType: eventData.eventType,
        jobTitle: job.title,
        company: job.company,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      throw new NotFoundException(`Job with ID ${eventData.jobPostingId} not found`);
    }
  }

  /**
   * Get job view count
   */
async getJobViewCount(jobId: number, dateRange?: DateRangeDto): Promise<number> {
  const cacheKey = `job-analytics:views:${jobId}:${this.getDateRangeKey(dateRange)}`;
  const cachedCount = await this.cacheManager.get(cacheKey, 'JobAnalyticsService');
  
  if (cachedCount !== undefined) {
    return cachedCount;
  }
  
  try {
    // Get direct database connection
    const connection = this.analyticsRepository['analyticsRepository'].manager.connection;
    
    // Use the SQL query that we know works
    const result = await connection.query(
      `SELECT COUNT(*) as count FROM job_analytic WHERE "jobPostingId" = $1 AND "eventType" = 'view'`,
      [jobId]
    );
    
    const count = parseInt(result[0]?.count || '0', 10);
    await this.cacheManager.set(cacheKey, count, 3600);
    return count;
  } catch (error) {
    return 0;
  }
}
  /**
   * Get job application count
   */
  async getJobApplicationCount(jobId: number, dateRange?: DateRangeDto): Promise<number> {
    const cacheKey = `job-analytics:applications:${jobId}:${this.getDateRangeKey(dateRange)}`;
    const cachedCount = await this.cacheManager.get(cacheKey, 'JobAnalyticsService');
    
    if (cachedCount !== undefined) {
      return cachedCount;
    }
    
    const count = await this.analyticsRepository.getJobApplicationCount(jobId, dateRange);
    await this.cacheManager.set(cacheKey, count, 3600); // Cache for 1 hour
    
    return count;
  }

  /**
   * Get comprehensive engagement metrics for a job
   */
  async getJobEngagementMetrics(jobId: number, dateRange?: DateRangeDto): Promise<JobEngagementMetricsDto> {
    const cacheKey = `job-analytics:engagement:${jobId}:${this.getDateRangeKey(dateRange)}`;
    const cachedMetrics = await this.cacheManager.get(cacheKey, 'JobAnalyticsService');
    
    if (cachedMetrics) {
      return cachedMetrics;
    }
    
    const metrics = await this.analyticsRepository.getJobEngagementMetrics(jobId, dateRange);
    await this.cacheManager.set(cacheKey, metrics, 3600); // Cache for 1 hour
    
    return metrics;
  }

  /**
   * Get top performing jobs by event type
   */
  async getTopPerformingJobs(
    limit: number = 10, 
    eventType: AnalyticsEventType = AnalyticsEventType.VIEW,
    dateRange?: DateRangeDto
  ): Promise<TopPerformingJobDto[]> {
    const cacheKey = `job-analytics:top-jobs:${eventType}:${limit}:${this.getDateRangeKey(dateRange)}`;
    const cachedJobs = await this.cacheManager.get(cacheKey, 'JobAnalyticsService');
    
    if (cachedJobs) {
      return cachedJobs;
    }
    
    const jobs = await this.analyticsRepository.getTopPerformingJobs(limit, eventType, dateRange);
    await this.cacheManager.set(cacheKey, jobs, 3600); // Cache for 1 hour
    
    return jobs;
  }

  /**
   * Get daily metrics for visualizations
   */
  async getDailyMetrics(
    jobId: number,
    eventType: AnalyticsEventType,
    dateRange: DateRangeDto
  ): Promise<DailyMetricsDto[]> {
    const cacheKey = `job-analytics:daily:${jobId}:${eventType}:${this.getDateRangeKey(dateRange)}`;
    const cachedMetrics = await this.cacheManager.get(cacheKey, 'JobAnalyticsService');
    
    if (cachedMetrics) {
      return cachedMetrics;
    }
    
    const metrics = await this.analyticsRepository.getDailyMetrics(jobId, eventType, dateRange);
    await this.cacheManager.set(cacheKey, metrics, 3600); // Cache for 1 hour
    
    return metrics;
  }

  /**
   * Get comprehensive dashboard for a job
   */
  async getJobAnalyticsDashboard(jobId: number, dateRange?: DateRangeDto): Promise<JobAnalyticsDashboardDto> {
    // Check if job exists
    const job = await this.jobPostingsService.findOne(jobId);
    
    // Create a date range that spans the last 30 days if not provided
    const effectiveDateRange = dateRange || {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    };
    
    // Get all required metrics in parallel
    const [metrics, dailyViews, dailyApplications] = await Promise.all([
      this.getJobEngagementMetrics(jobId, effectiveDateRange),
      this.getDailyMetrics(jobId, AnalyticsEventType.VIEW, effectiveDateRange),
      this.getDailyMetrics(jobId, AnalyticsEventType.APPLICATION, effectiveDateRange),
    ]);
    
    return {
      jobId,
      jobTitle: job.title,
      company: job.company,
      metrics,
      dailyViews,
      dailyApplications,
    };
  }

  /**
   * Helper method to generate a cache key from date range
   */
  private getDateRangeKey(dateRange?: DateRangeDto): string {
    if (!dateRange) {
      return 'all-time';
    }
    
    const startDate = new Date(dateRange.startDate).toISOString().split('T')[0];
    const endDate = new Date(dateRange.endDate).toISOString().split('T')[0];
    return `${startDate}_to_${endDate}`;
  }

  /**
   * Clear analytics cache for a job
   */
  private async clearAnalyticsCache(jobId: number): Promise<void> {
    const cacheKeys = [
      `job-analytics:views:${jobId}:all-time`,
      `job-analytics:applications:${jobId}:all-time`,
      `job-analytics:engagement:${jobId}:all-time`,
    ];
    
    // Delete all cache keys
    await Promise.all(cacheKeys.map(key => this.cacheManager.del(key)));
  }
}