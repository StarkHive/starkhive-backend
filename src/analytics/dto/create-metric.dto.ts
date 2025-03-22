
// src/analytics/dto/create-metric.dto.ts
import { IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { MetricType } from '../enums/metric-types.enum';


export class CreateMetricDto {
  @IsNotEmpty()
  @IsEnum(MetricType)
  type: MetricType;

  @IsNumber()
  value: number;

  @IsOptional()
  resourceType?: string;

  @IsOptional()
  resourceId?: string;

  @IsOptional()
  metadata?: any;
}
