
import { IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ContentStatus } from '../enums/content-status.enum';

export class ModerateContentDto {
  @IsNotEmpty()
  @IsEnum(ContentStatus)
  status: ContentStatus;

  @IsOptional()
  moderationNotes?: string;
}