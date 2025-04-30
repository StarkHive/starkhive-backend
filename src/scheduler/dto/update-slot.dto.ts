import { PartialType } from '@nestjs/mapped-types';
import { CreateSlotDto } from './create-slot.dto';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateSlotDto extends PartialType(CreateSlotDto) {
  @IsOptional()
  @IsString()
  @IsIn(['proposed', 'confirmed', 'cancelled', 'completed'])
  status?: string;
}