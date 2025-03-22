// src/content/dto/content-filter.dto.ts
import { IsOptional, IsEnum } from 'class-validator';
import { ContentStatus } from '../enums/content-status.enum';
import { ContentType } from '../enums/content-type.enum';

export class ContentFilterDto {
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType;

  @IsOptional()
  creatorId?: string;

  @IsOptional()
  search?: string;
}
