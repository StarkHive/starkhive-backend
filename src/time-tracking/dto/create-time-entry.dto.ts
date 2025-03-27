import { IsNotEmpty, IsUUID, IsOptional, IsString, IsDate, IsNumber } from 'class-validator';

export class CreateTimeEntryDto {
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsDate()
  @IsNotEmpty()
  startTime: Date;

  @IsDate()
  @IsOptional()
  endTime?: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  duration?: number;
}
