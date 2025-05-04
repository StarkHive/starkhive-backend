import { IsNotEmpty, IsString, IsUUID } from "class-validator"

export class ClaimReferralDto {
  @IsNotEmpty()
  @IsString()
  referralCode: string

  @IsNotEmpty()
  @IsUUID()
  inviteeId: string
}
