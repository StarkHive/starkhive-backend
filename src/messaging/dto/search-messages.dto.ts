import { IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchMessagesDto {
  @ApiProperty({
    description: 'Search query for message content',
    required: false,
    example: 'project discussion'
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({
    description: 'Filter by conversation partner ID',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsUUID()
  partnerId?: string;

  @ApiProperty({
    description: 'Start date for search range',
    required: false,
    example: '2025-01-01T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for search range',
    required: false,
    example: '2025-12-31T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
