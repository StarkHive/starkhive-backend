

import { IsOptional, IsNumberString } from 'class-validator';

export class TimelineQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
