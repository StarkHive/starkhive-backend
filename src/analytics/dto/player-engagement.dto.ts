import { IsString, IsNumber, IsOptional } from 'class-validator';

export class PlayerEngagementDto {
  @IsString()
  playerId: string;

  @IsNumber()
  engagementScore: number;

  @IsOptional()
  @IsString()
  activityType?: string;
}
