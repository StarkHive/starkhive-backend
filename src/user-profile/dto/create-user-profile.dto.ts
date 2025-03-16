import {
  IsString,
  IsEmail,
  IsArray,
  IsOptional,
  IsIn,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateUserProfileDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  walletAddress: string;

  @IsOptional()
  @IsString()
  @IsIn(['ETH', 'USDC', 'STARKNET'])
  paymentPreference?: string = 'ETH';

  @IsArray()
  @IsOptional()
  skills?: string[] = [];

  @IsArray()
  @IsOptional()
  workHistory?: string[] = [];

  @IsNumber()
  @IsOptional()
  reputationScore?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
