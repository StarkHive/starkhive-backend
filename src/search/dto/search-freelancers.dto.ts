import { IsOptional, IsString, IsNumber, IsEnum, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum FreelancerSortField {
  RATING = 'rating',
  HOURLY_RATE = 'hourlyRate',
  EXPERIENCE = 'experience',
  RELEVANCE = 'relevance',
}

export class SearchFreelancersDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minHourlyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxHourlyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minExperience?: number;

  @IsOptional()
  @IsEnum(FreelancerSortField)
  sortBy?: FreelancerSortField = FreelancerSortField.RELEVANCE;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit: number = 10;
}
