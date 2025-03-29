import { IsEnum, IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AnalyticsEventType } from '../entities/job-analytic.entity';

export class CreateAnalyticsEventDto {
  @IsNumber()
  @Type(() => Number)
  jobPostingId: number; // Changed to number with appropriate validation

  @IsEnum(AnalyticsEventType)
  eventType: AnalyticsEventType;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  referrer?: string;
}

export class DateRangeDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

export class JobAnalyticsQueryDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  jobId: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class TopJobsQueryDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @IsEnum(AnalyticsEventType)
  @IsOptional()
  eventType?: AnalyticsEventType = AnalyticsEventType.VIEW;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class DailyMetricsQueryDto {
  @IsNumber()
  @Type(() => Number)
  jobId: number; // Changed to number with appropriate validation

  @IsEnum(AnalyticsEventType)
  eventType: AnalyticsEventType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}