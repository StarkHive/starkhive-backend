import { IsNotEmpty, IsUUID, IsOptional, IsString } from 'class-validator';

export class StartTrackingDto {
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsOptional()
  description?: string;
}
