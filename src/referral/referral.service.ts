import { Injectable } from '@nestjs/common';
import { Referral } from './referral.entity';
import { ReferralMilestone } from './referral-milestone.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ReferralService {
    constructor(
        @InjectRepository(Referral)
        private referralRepository: Repository<Referral>,
        @InjectRepository(ReferralMilestone)
        private milestoneRepository: Repository<ReferralMilestone>,
    ) {}

    async generateReferralCode(userId: string): Promise<string> {
        const referralCode = `REF-${userId}-${Date.now()}`;
        const referral = this.referralRepository.create({ referralCode, referrer: { id: userId } });
        await this.referralRepository.save(referral);
        return referralCode;
    }

    async trackSignup(referralCode: string): Promise<void> {
        const referral = await this.referralRepository.findOne({ where: { referralCode } });
        if (referral) {
            referral.signups += 1;
            await this.referralRepository.save(referral);
            await this.checkMilestones(referral);
        }
    }

    private async checkMilestones(referral: Referral): Promise<void> {
        const milestones = await this.milestoneRepository.find();
        for (const milestone of milestones) {
            if (referral.signups >= milestone.milestone && !referral.milestoneRewarded) {
                referral.milestoneRewarded = true;
                await this.referralRepository.save(referral);
                // Logic to apply reward (e.g., badge, cash)
            }
        }
    }

    async getReferralStats(userId: number): Promise<Referral | null> {
        const referral = await this.referralRepository.findOne({
            where: { referrer: { id: userId.toString() } }, // Convert userId to string
        });
        if (!referral) {
            return null; // Handle the case where no referral is found
        }
        return referral;
    }}
