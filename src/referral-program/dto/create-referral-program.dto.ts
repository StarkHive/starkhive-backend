import { IsNotEmpty, IsString, IsOptional, IsUUID } from "class-validator"

export class CreateReferralDto {
  @IsNotEmpty()
  @IsString()
  referralCode: string

  @IsNotEmpty()
  @IsUUID()
  inviterId: string

  @IsOptional()
  @IsUUID()
  inviteeId?: string
}
