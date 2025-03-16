import { IsNotEmpty, IsUUID, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsUUID()
  contractId: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  transactionHash?: string;
}