import { IsString, IsArray, IsOptional, IsUrl } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  evidenceUrls?: string[];
} 