import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { JobAnalytic, AnalyticsEventType } from '../entities/job-analytic.entity';
import { 
  IJobAnalyticsRepository, 
  CreateAnalyticsEventDto, 
  DateRangeDto, 
  JobEngagementMetricsDto, 
  TopPerformingJobDto,
  DailyMetricsDto
} from '../interfaces/job-analytics.interface';

@Injectable()
export class JobAnalyticsRepository implements IJobAnalyticsRepository {
  constructor(
    @InjectRepository(JobAnalytic)
    private readonly analyticsRepository: Repository<JobAnalytic>,
  ) {}

  async trackEvent(eventData: CreateAnalyticsEventDto): Promise<void> {
    const analyticsEvent = this.analyticsRepository.create(eventData);
    await this.analyticsRepository.save(analyticsEvent);
  }

async getJobViewCount(jobId: number, dateRange?: DateRangeDto): Promise<number> {
  
  const where: any = {
    jobPostingId: jobId,
    eventType: AnalyticsEventType.VIEW,
  };

  if (dateRange) {
    where.createdAt = Between(dateRange.startDate, dateRange.endDate);
  }

  
  // Try direct SQL query first
  try {
    const sqlResult = await this.analyticsRepository.query(
      `SELECT COUNT(*) as count FROM job_analytic WHERE "jobPostingId" = $1 AND "eventType" = 'view'`,
      [jobId]
    );
    
    if (sqlResult && sqlResult[0]) {
      const count = parseInt(sqlResult[0].count, 10);
      return count;
    }
  } catch (sqlError) {
  }
  
  // Fall back to TypeORM count method
  try {
    const count = await this.analyticsRepository.count({ where });
    return count || 0;
  } catch (typeormError) {
    return 0;
  }
}

  async getJobApplicationCount(jobId: number, dateRange?: DateRangeDto): Promise<number> {
    const where: any = {
      jobPostingId: jobId,
      eventType: AnalyticsEventType.APPLICATION,
    };

    if (dateRange) {
      where.createdAt = Between(dateRange.startDate, dateRange.endDate);
    }

    return await this.analyticsRepository.count({ where });
  }

  async getJobEngagementMetrics(jobId: number, dateRange?: DateRangeDto): Promise<JobEngagementMetricsDto> {
    const where: any = { jobPostingId: jobId };
    if (dateRange) {
      where.createdAt = Between(dateRange.startDate, dateRange.endDate);
    }

    // Get counts for each event type
    const viewsPromise = this.analyticsRepository.count({
      where: { ...where, eventType: AnalyticsEventType.VIEW },
    });
    const applicationsPromise = this.analyticsRepository.count({
      where: { ...where, eventType: AnalyticsEventType.APPLICATION },
    });
    const clicksPromise = this.analyticsRepository.count({
      where: { ...where, eventType: AnalyticsEventType.CLICK },
    });
    const sharesPromise = this.analyticsRepository.count({
      where: { ...where, eventType: AnalyticsEventType.SHARE },
    });
    const bookmarksPromise = this.analyticsRepository.count({
      where: { ...where, eventType: AnalyticsEventType.BOOKMARK },
    });

    const [views, applications, clicks, shares, bookmarks] = await Promise.all([
      viewsPromise,
      applicationsPromise,
      clicksPromise,
      sharesPromise,
      bookmarksPromise,
    ]);

    // Calculate rates
    const applicationRate = views > 0 ? (applications / views) * 100 : 0;
    const clickThroughRate = views > 0 ? (clicks / views) * 100 : 0;

    return {
      views,
      applications,
      clicks,
      shares,
      bookmarks,
      applicationRate,
      clickThroughRate,
    };
  }

  async getTopPerformingJobs(
    limit: number,
    eventType: AnalyticsEventType,
    dateRange?: DateRangeDto,
  ): Promise<TopPerformingJobDto[]> {
    const queryBuilder = this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.jobPostingId', 'jobId')
      .addSelect('COUNT(analytics.id)', 'count')
      .addSelect('job.title', 'jobTitle')
      .addSelect('job.company', 'company')
      .leftJoin('analytics.jobPosting', 'job')
      .where('analytics.eventType = :eventType', { eventType })
      .groupBy('analytics.jobPostingId')
      .addGroupBy('job.title')
      .addGroupBy('job.company')
      .orderBy('count', 'DESC')
      .limit(limit);

    if (dateRange) {
      queryBuilder.andWhere('analytics.createdAt BETWEEN :startDate AND :endDate', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
    }

    const result = await queryBuilder.getRawMany();
    return result.map((row) => ({
      jobId: Number(row.jobId),
      jobTitle: row.jobTitle,
      company: row.company,
      count: Number(row.count),
    }));
  }

  async getDailyMetrics(
    jobId: number, 
    eventType: AnalyticsEventType, 
    dateRange: DateRangeDto
  ): Promise<DailyMetricsDto[]> {
    const queryBuilder = this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('DATE(analytics.createdAt)', 'date')
      .addSelect('COUNT(analytics.id)', 'count')
      .where('analytics.jobPostingId = :jobId', { jobId })
      .andWhere('analytics.eventType = :eventType', { eventType })
      .andWhere('analytics.createdAt BETWEEN :startDate AND :endDate', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
      .groupBy('DATE(analytics.createdAt)')
      .orderBy('date', 'ASC');

    const result = await queryBuilder.getRawMany();
    return result.map((row) => ({
      date: row.date,
      count: Number(row.count),
    }));
  }
}