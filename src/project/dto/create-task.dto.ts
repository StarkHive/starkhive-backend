import { IsNotEmpty, IsString, IsOptional, IsDate, IsNumber, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assigneeIds?: string[];

  @IsOptional()
  @IsString()
  parentTaskId?: string;

  @IsOptional()
  @IsNumber()
  completionPercentage?: number;
} 