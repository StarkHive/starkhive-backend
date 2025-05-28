import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { JobFitCache } from './job-fit.cache';
import { JobFitScore } from './job-fit.interface';
import { FreelancerProfileService } from '../freelancer-profile/freelancer-profile.service';
import { JobPostingsService } from '../job-postings/job-postings.service';
import { EndorsementService } from '../endorsement/endorsement.service';
import { ContractService } from '../contract/contract.service';

@Injectable()
export class JobFitService {
    constructor(
        private readonly cache: JobFitCache,
        private readonly freelancerProfileService: FreelancerProfileService,
        private readonly jobPostingsService: JobPostingsService,
        private readonly endorsementService: EndorsementService,
        private readonly contractService: ContractService,
    ) {}

    async computeJobFitScore(userId: string, jobId: string): Promise<JobFitScore> {
        const cached = await this.cache.get(userId, jobId);
        if (cached !== null) return cached;

        const userProfile = await this.freelancerProfileService.getProfileByUserId(userId);
        if (!userProfile) throw new NotFoundException('User profile not found');
        const userSkills: string[] = userProfile.skills || [];

        const job = await this.jobPostingsService.findOne(Number(jobId));
        if (!job) throw new NotFoundException('Job posting not found');
        const jobSkills = this.extractSkillsFromDescription(job.description);

        let score = this.computeCosineSimilarity(userSkills, jobSkills);

        let endorsementBoost = 0;
        try {
            if (userProfile.id) {
                const profileId = typeof userProfile.id === 'string' ? parseInt(userProfile.id, 10) : userProfile.id;
                const endorsements = await this.endorsementService.getEndorsementsForProfile(
                    profileId,
                    'skill',
                    'DESC',
                );
                const skillEndorsementCounts: Record<string, number> = {};
                for (const endorsement of endorsements) {
                    const skill = (endorsement.skill || '').toLowerCase();
                    skillEndorsementCounts[skill] = (skillEndorsementCounts[skill] || 0) + 1;
                }
                for (const skill of jobSkills) {
                    const lowerSkill = skill.toLowerCase();
                    const count = skillEndorsementCounts[lowerSkill] || 0;
                    if (count >= 3) {
                        endorsementBoost += 5;
                    } else if (count > 0) {
                        endorsementBoost += 2;
                    }
                }
            }
        } catch (e) {
            endorsementBoost = 0;
        }

        let contractBoost = 0;
        try {
            const completedContracts = await this.contractService.findByUserId(userId, true);
            for (const contract of completedContracts) {
                if (contract.jobPosting && contract.jobPosting.description) {
                    const contractSkills = this.extractSkillsFromDescription(contract.jobPosting.description);
                    const overlap = contractSkills.filter(skill => jobSkills.includes(skill));
                    if (overlap.length > 0) {
                        contractBoost += 10;
                    }
                }
            }
        } catch (e) {
            contractBoost = 0;
        }

        let finalScore = score + endorsementBoost + contractBoost;
        if (finalScore > 100) finalScore = 100;

        await this.cache.set(userId, jobId, finalScore);
        return finalScore;
    }

    private extractSkillsFromDescription(description: string): string[] {
        if (!description) return [];
        return description
            .split(/[,.;\n]/)
            .map(s => s.trim().toLowerCase())
            .filter(s => s.length > 1 && s.length < 50);
    }

    private computeCosineSimilarity(userSkills: string[], jobSkills: string[]): number {
        if (!userSkills.length || !jobSkills.length) return 0;

        const allSkills = Array.from(new Set([
            ...userSkills.map(s => s.toLowerCase()),
            ...jobSkills.map(s => s.toLowerCase())
        ]));

        const userVec: number[] = allSkills.map(skill =>
            userSkills.map(s => s.toLowerCase()).includes(skill) ? 1 : 0,
        );

        const jobVec: number[] = allSkills.map(skill =>
            jobSkills.map(s => s.toLowerCase()).includes(skill) ? 1 : 0,
        );

        const dot = userVec.reduce((sum, val, i) => sum + val * jobVec[i], 0);
        const normA = Math.sqrt(userVec.reduce((sum, val) => sum + val * val, 0));
        const normB = Math.sqrt(jobVec.reduce((sum, val) => sum + val * val, 0));

        if (normA === 0 || normB === 0) return 0;

        return Math.round((dot / (normA * normB)) * 100);
    }
}
