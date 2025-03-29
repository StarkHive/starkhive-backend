import { AnalyticsEventType } from '../entities/job-analytic.entity';

export interface IJobAnalyticsRepository {
  trackEvent(eventData: CreateAnalyticsEventDto): Promise<void>;
  getJobViewCount(jobId: number, dateRange?: DateRangeDto): Promise<number>;
  getJobApplicationCount(jobId: number, dateRange?: DateRangeDto): Promise<number>;
  getJobEngagementMetrics(jobId: number, dateRange?: DateRangeDto): Promise<JobEngagementMetricsDto>;
  getTopPerformingJobs(limit: number, eventType: AnalyticsEventType, dateRange?: DateRangeDto): Promise<TopPerformingJobDto[]>;
  getDailyMetrics(jobId: number, eventType: AnalyticsEventType, dateRange: DateRangeDto): Promise<DailyMetricsDto[]>;
}

export interface IJobAnalyticsService {
  trackEvent(eventData: CreateAnalyticsEventDto): Promise<void>;
  getJobViewCount(jobId: number, dateRange?: DateRangeDto): Promise<number>;
  getJobApplicationCount(jobId: number, dateRange?: DateRangeDto): Promise<number>;
  getJobEngagementMetrics(jobId: number, dateRange?: DateRangeDto): Promise<JobEngagementMetricsDto>;
  getTopPerformingJobs(limit: number, eventType: AnalyticsEventType, dateRange?: DateRangeDto): Promise<TopPerformingJobDto[]>;
  getJobAnalyticsDashboard(jobId: number, dateRange?: DateRangeDto): Promise<JobAnalyticsDashboardDto>;
  getDailyMetrics(jobId: number, eventType: AnalyticsEventType, dateRange: DateRangeDto): Promise<DailyMetricsDto[]>;
}

export interface CreateAnalyticsEventDto {
  jobPostingId: number; // Changed to number
  eventType: AnalyticsEventType;
  userId?: number;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
}

export interface DateRangeDto {
  startDate: Date;
  endDate: Date;
}

export interface JobEngagementMetricsDto {
  views: number;
  applications: number;
  clicks: number;
  shares: number;
  bookmarks: number;
  applicationRate: number; // applications / views
  clickThroughRate: number; // clicks / views
}

export interface TopPerformingJobDto {
  jobId: number; // Changed to number
  jobTitle: string;
  company: string;
  count: number;
}

export interface DailyMetricsDto {
  date: string;
  count: number;
}

export interface JobAnalyticsDashboardDto {
  jobId: number; // Changed to number
  jobTitle: string;
  company: string;
  metrics: JobEngagementMetricsDto;
  dailyViews: DailyMetricsDto[];
  dailyApplications: DailyMetricsDto[];
}