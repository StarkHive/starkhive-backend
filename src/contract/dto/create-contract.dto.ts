import { IsNotEmpty, IsUUID, IsDateString, IsBoolean, IsString } from 'class-validator';

export class CreateContractDto {
  @IsNotEmpty()
  @IsString()
  terms: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

  @IsUUID()
  userId: string;

  @IsUUID()
  jobPostingId: string;
}