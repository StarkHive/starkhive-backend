import { IsOptional, IsString, IsNumber, IsEnum, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum JobSortField {
  CREATED_AT = 'createdAt',
  SALARY = 'salary',
  TITLE = 'title',
  RELEVANCE = 'relevance',
}

export class SearchJobsDto {
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
  minSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxSalary?: number;

  @IsOptional()
  @IsEnum(JobSortField)
  sortBy?: JobSortField = JobSortField.CREATED_AT;

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
