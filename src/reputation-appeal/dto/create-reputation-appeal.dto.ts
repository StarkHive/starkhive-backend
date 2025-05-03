import { IsNotEmpty, IsNumber, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReputationAppealDto {
  @ApiProperty({
    description: 'ID of the transaction being appealed',
    example: 123
  })
  @IsNotEmpty()
  @IsNumber()
  transactionId: number;

  @ApiProperty({
    description: 'Reason for the appeal',
    example: 'The reputation change was incorrect because...'
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;

  @ApiProperty({
    description: 'Additional evidence or context for the appeal',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  additionalDetails?: string;
}