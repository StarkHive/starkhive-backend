import { IsNotEmpty, IsString, IsOptional, IsDate, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { MilestoneStatus } from '../entities/milestone.entity';

export class CreateMilestoneDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(MilestoneStatus)
  status?: MilestoneStatus;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  dueDate: Date;

  @IsOptional()
  @IsBoolean()
  isPaymentLinked?: boolean;

  @IsOptional()
  @IsNumber()
  paymentAmount?: number;

  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsOptional()
  @IsNumber()
  order?: number;
} 