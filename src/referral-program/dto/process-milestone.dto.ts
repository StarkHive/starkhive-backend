import { IsNotEmpty, IsUUID, IsEnum } from "class-validator"
import { RewardMilestoneType } from "../entities/referral-reward.entity"

export class ProcessMilestoneDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string

  @IsNotEmpty()
  @IsEnum(RewardMilestoneType)
  milestoneType: RewardMilestoneType
}
