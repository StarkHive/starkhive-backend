import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VerificationStatus } from '../enums/verification-status.enum';

export class UpdateKycVerificationDto {
  @IsEnum(VerificationStatus)
  status: VerificationStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsNotEmpty()
  @IsString()
  reviewedBy: string;
}