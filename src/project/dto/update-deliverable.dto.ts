import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliverableDto } from './create-deliverable.dto';
import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDeliverableDto extends PartialType(CreateDeliverableDto) {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  submittedAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  approvedAt?: Date;
} 