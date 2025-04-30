import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsDateString, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterDto {
  @ApiProperty({ required: false, description: 'Filter by job ID' })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiProperty({ required: false, description: 'Filter by start date' })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({ required: false, description: 'Filter by end date' })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({ required: false, description: 'Filter by location' })
  @IsOptional()
  @IsString()
  location?: string;
}