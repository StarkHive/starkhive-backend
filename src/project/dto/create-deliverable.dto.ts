import { IsNotEmpty, IsString, IsOptional, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliverableStatus } from '../entities/deliverable.entity';

export class CreateDeliverableDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DeliverableStatus)
  status?: DeliverableStatus;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  dueDate: Date;

  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  milestoneId?: string;

  @IsOptional()
  @IsString()
  clientFeedback?: string;
} 