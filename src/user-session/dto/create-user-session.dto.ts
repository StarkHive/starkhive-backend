import { IsString, IsOptional } from 'class-validator';

export class CreateUserSessionDto {
  @IsString()
  userId: string;

  @IsString()
  ipAddress: string;

  @IsString()
  userAgent: string;

  @IsOptional()
  @IsString()
  deviceType?: string;
}
