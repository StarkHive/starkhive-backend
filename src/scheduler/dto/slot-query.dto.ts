import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';

export class SlotQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  @IsIn(['proposed', 'confirmed', 'cancelled', 'completed'])
  status?: string;
}