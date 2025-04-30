import { IsString, IsNumber, IsEnum, IsArray, ValidateNested, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class EscrowPaymentSplitDto {
  @IsOptional()
  @IsString()
  milestoneId?: string;

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;
}

export class CreateEscrowPaymentDto {
  @IsString()
  projectId: string;

  @IsNumber()
  totalAmount: number;

  @IsEnum(['milestone', 'participant'])
  splitType: 'milestone' | 'participant';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EscrowPaymentSplitDto)
  splits: EscrowPaymentSplitDto[];
}
