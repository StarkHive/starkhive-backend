import { IsString, IsOptional, IsNumber, isString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  company: string;
  
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  employmentType?: string; // Full-time, Part-time, Contract, Remote, etc.

  @IsOptional()
  @IsString()
  experienceLevel?: string; // Entry, Mid, Senior
}
