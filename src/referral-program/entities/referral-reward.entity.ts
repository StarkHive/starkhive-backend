import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Referral } from "./referral.entity"

export enum RewardMilestoneType {
  SIGNUP = "signup",
  JOB_COMPLETION = "job_completion",
}

export enum RewardType {
  CREDIT = "credit",
  DISCOUNT = "discount",
  BONUS = "bonus",
}

@Entity("referral_rewards")
export class ReferralReward {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "referral_id" })
  referralId: string

  @ManyToOne(
    () => Referral,
    (referral) => referral.rewards,
  )
  @JoinColumn({ name: "referral_id" })
  referral: Referral

  @Column({
    type: "enum",
    enum: RewardMilestoneType,
    name: "milestone_type",
  })
  milestoneType: RewardMilestoneType

  @Column({
    type: "enum",
    enum: RewardType,
    name: "reward_type",
  })
  rewardType: RewardType

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number

  @Column({ default: false })
  processed: boolean

  @Column({ name: "processed_at", nullable: true })
  processedAt: Date

  @Column({ nullable: true })
  description: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date
}
