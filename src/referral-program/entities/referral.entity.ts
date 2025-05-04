import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm"
import { ReferralReward } from "./referral-reward.entity"
import { User } from "@src/user/entities/user.entity"

@Entity("referrals")
export class Referral {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "referral_code", unique: true })
  referralCode: string

  @Column({ name: "inviter_id" })
  inviterId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "inviter_id" })
  inviter: User

  @Column({ name: "invitee_id", nullable: true })
  inviteeId: string

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "invitee_id" })
  invitee: User

  @Column({ default: false })
  claimed: boolean

  @Column({ name: "claimed_at", nullable: true })
  claimedAt: Date

  @OneToMany(
    () => ReferralReward,
    (reward) => reward.referral,
  )
  rewards: ReferralReward[]

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
