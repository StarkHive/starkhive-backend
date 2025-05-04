import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { In, type Repository } from "typeorm"
import { v4 as uuidv4 } from "uuid"
import { Referral } from "./entities/referral.entity"
import { ReferralReward, RewardMilestoneType, RewardType } from "./entities/referral-reward.entity"
import { ClaimReferralDto } from "./dto/claim-referral.dto"
import { ProcessMilestoneDto } from "./dto/process-milestone.dto"
import { CreateReferralDto } from "./dto/create-referral-program.dto"

@Injectable()
export class ReferralProgramService {
  constructor(
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
    @InjectRepository(ReferralReward)
    private referralRewardRepository: Repository<ReferralReward>,
  ) { }

  /**
   * Generate a unique referral code for a user
   */
  async generateReferralCode(userId: string): Promise<string> {
  let referralCode: string;
  let exists: Referral | undefined;

  do {
    const randomPart = uuidv4().substring(0, 8);
    referralCode = `${userId.substring(0, 4)}-${randomPart}`.toUpperCase();

    exists = (await this.referralRepository.findOne({ where: { referralCode } })) ?? undefined;
  } while (exists);

  return referralCode;
  }


  /**
   * Create a new referral
   */
  async createReferral(createReferralDto: CreateReferralDto): Promise<Referral> {
    const { referralCode, inviterId, inviteeId } = createReferralDto

    // Check if referral code already exists
    const existingReferral = await this.referralRepository.findOne({
      where: { referralCode },
    })

    if (existingReferral) {
      throw new ConflictException("Referral code already exists")
    }

    const referral = this.referralRepository.create({
      referralCode,
      inviterId,
      inviteeId,
      claimed: !!inviteeId,
      claimedAt: inviteeId ? new Date() : undefined,
    })

    return this.referralRepository.save(referral)
  }

  /**
   * Claim a referral using a referral code
   */
  async claimReferral(claimReferralDto: ClaimReferralDto): Promise<Referral> {
  const { referralCode, inviteeId } = claimReferralDto;

  const referral = await this.referralRepository.findOne({
    where: { referralCode },
  });

  if (!referral) {
    throw new NotFoundException("Referral code not found");
  }

  if (referral.claimed) {
    throw new ConflictException("Referral code has already been claimed");
  }

  if (referral.inviterId === inviteeId) {
    throw new BadRequestException("Users cannot refer themselves");
  }

  referral.inviteeId = inviteeId;
  referral.claimed = true;
  referral.claimedAt = new Date();

  const updatedReferral = await this.referralRepository.save(referral);

  // Prevent duplicate reward creation for SIGNUP
  const existingSignupReward = await this.referralRewardRepository.findOne({
    where: {
      referralId: updatedReferral.id,
      milestoneType: RewardMilestoneType.SIGNUP,
    },
  });

  if (!existingSignupReward) {
    await this.createReward(
      updatedReferral.id,
      RewardMilestoneType.SIGNUP,
      RewardType.CREDIT,
      10.0,
      "Reward for successful signup referral",
    );
  }

  return updatedReferral;
  }


  /**
   * Create a reward for a referral
   */
  private async createReward(
    referralId: string,
    milestoneType: RewardMilestoneType,
    rewardType: RewardType,
    amount: number,
    description: string,
  ): Promise<ReferralReward> {
    const reward = this.referralRewardRepository.create({
      referralId,
      milestoneType,
      rewardType,
      amount,
      description,
      processed: false,
    })

    return this.referralRewardRepository.save(reward)
  }

  /**
   * Process a milestone for a user and apply rewards if applicable
   */
  async processMilestone(processMilestoneDto: ProcessMilestoneDto): Promise<ReferralReward | null> {
    const { userId, milestoneType } = processMilestoneDto

    // Find the referral where this user is the invitee
    const referral = await this.referralRepository.findOne({
      where: { inviteeId: userId, claimed: true },
    })

    if (!referral) {
      // User was not referred, no reward to process
      return null
    }

    // Check if this milestone has already been rewarded
    const existingReward = await this.referralRewardRepository.findOne({
      where: {
        referralId: referral.id,
        milestoneType,
      },
    })

    if (existingReward) {
      // Milestone already rewarded
      return existingReward
    }

    // Determine reward amount based on milestone type
    let amount = 0
    let description = ""

    switch (milestoneType) {
      case RewardMilestoneType.SIGNUP:
        amount = 10.0
        description = "Reward for successful signup referral"
        break
      case RewardMilestoneType.JOB_COMPLETION:
        amount = 25.0
        description = "Reward for job completion by referred user"
        break
      default:
        throw new BadRequestException("Invalid milestone type")
    }

    // Create and process the reward
    const reward = await this.createReward(referral.id, milestoneType, RewardType.CREDIT, amount, description)

    // Mark the reward as processed
    reward.processed = true
    reward.processedAt = new Date()

    return this.referralRewardRepository.save(reward)
  }

  /**
   * Get all referrals for a specific user (as inviter)
   */
  async getUserReferrals(userId: string): Promise<Referral[]> {
    return this.referralRepository.find({
      where: { inviterId: userId },
      relations: ["invitee", "rewards"],
    })
  }

  /**
   * Get all rewards for a specific user
   */
  async getUserRewards(userId: string): Promise<ReferralReward[]> {
    const referrals = await this.referralRepository.find({
      where: { inviterId: userId },
    })

    if (!referrals.length) {
      return []
    }

    const referralIds = referrals.map((referral) => referral.id)

    return this.referralRewardRepository.find({
      where: { referralId: In(referralIds) },
      relations: ["referral", "referral.invitee"],
    })
  }

  /**
   * Get referral tree for admin view
   */
  async getReferralTree(rootUserId: string, depth = 3): Promise<any> {
  type ReferralTreeNode = {
    referralId: string;
    inviteeId: string;
    claimedAt: Date;
    children?: ReferralTreeNode[];
  };

  const buildTree = async (inviterId: string, currentDepth: number): Promise<ReferralTreeNode[]> => {
    if (currentDepth <= 0) return [];

    const referrals = await this.referralRepository.find({
      where: { inviterId },
      relations: ["invitee"],
    });

    const nodes: ReferralTreeNode[] = [];
    for (const referral of referrals) {
      const children = await buildTree(referral.inviteeId, currentDepth - 1);
      nodes.push({
        referralId: referral.id,
        inviteeId: referral.inviteeId,
        claimedAt: referral.claimedAt,
        children,
      });
    }
    return nodes;
  };

  return {
    userId: rootUserId,
    referrals: await buildTree(rootUserId, depth),
  };
}

  /**
   * Get detailed statistics for admin dashboard
   */
  async getAdminStats(): Promise<any> {
    const totalReferrals = await this.referralRepository.count()
    const claimedReferrals = await this.referralRepository.count({ where: { claimed: true } })
    const totalRewards = await this.referralRewardRepository.count()

    const processedRewards = await this.referralRewardRepository.count({
      where: { processed: true },
    })

    const totalRewardAmount = await this.referralRewardRepository
      .createQueryBuilder("reward")
      .select("SUM(reward.amount)", "total")
      .where("reward.processed = :processed", { processed: true })
      .getRawOne()

    return {
      totalReferrals,
      claimedReferrals,
      conversionRate: totalReferrals > 0 ? (claimedReferrals / totalReferrals) * 100 : 0,
      totalRewards,
      processedRewards,
      totalRewardAmount: totalRewardAmount?.total || 0,
    }
  }
}
