import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { VerificationStatus } from '../enums/verification-status.enum';

export class FilterDocumentsDto {
  @IsOptional()
  @IsEnum(VerificationStatus)
  status?: VerificationStatus;

  @IsOptional()
  @IsString()
  documentType?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}