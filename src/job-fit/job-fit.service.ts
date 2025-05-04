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
        // 1. Try cache
        const cached = await this.cache.get(userId, jobId);
        if (cached !== null) return cached;

        // 2. Fetch user profile
        const userProfile = await this.freelancerProfileService.getProfileByUserId(userId);
        if (!userProfile) throw new NotFoundException('User profile not found');
        const userSkills: string[] = userProfile.skills || [];

        // 3. Fetch job posting
        const job = await this.jobPostingsService.findOne(Number(jobId));
        if (!job) throw new NotFoundException('Job posting not found');
        const jobSkills = this.extractSkillsFromDescription(job.description);

        // 4. Compute base cosine similarity between userSkills and jobSkills
        let score = this.computeCosineSimilarity(userSkills, jobSkills);

        // 5. Integrate endorsements: boost score for highly endorsed job-required skills
        let endorsementBoost = 0;
        try {
            // getEndorsementsForProfile expects profileId (number), so fetch from userProfile
            if (userProfile.id) {
                // Ensure profileId is a number
                const profileId = typeof userProfile.id === 'string' ? parseInt(userProfile.id, 10) : userProfile.id;
                const endorsements = await this.endorsementService.getEndorsementsForProfile(
                    profileId,
                    'skill',
                    'DESC',
                );
                // Count endorsements for each skill
                const skillEndorsementCounts: Record<string, number> = {};
                for (const endorsement of endorsements) {
                    const skill = (endorsement.skill || '').toLowerCase();
                    skillEndorsementCounts[skill] = (skillEndorsementCounts[skill] || 0) + 1;
                }
                // Boost for job-required skills that are highly endorsed
                for (const skill of jobSkills) {
                    const lowerSkill = skill.toLowerCase();
                    const count = skillEndorsementCounts[lowerSkill] || 0;
                    if (count >= 3) {
                        endorsementBoost += 5; // +5 for each job-required skill with 3+ endorsements
                    } else if (count > 0) {
                        endorsementBoost += 2; // +2 for each job-required skill with 1-2 endorsements
                    }
                }
            }
        } catch (e) {
            // Defensive: don't let endorsement fetch errors break scoring
            endorsementBoost = 0;
        }

        // 6. Integrate contract history: boost score for completed contracts matching job skills
        let contractBoost = 0;
        try {
            const completedContracts = await this.contractService.findByUserId(userId, true);
            for (const contract of completedContracts) {
                // Assume contract has a jobPosting with a description or skills
                if (contract.jobPosting && contract.jobPosting.description) {
                    const contractSkills = this.extractSkillsFromDescription(contract.jobPosting.description);
                    // If overlap with jobSkills, boost
                    const overlap = contractSkills.filter(skill => jobSkills.includes(skill));
                    if (overlap.length > 0) {
                        contractBoost += 10; // +10 for each relevant completed contract
                    }
                }
            }
        } catch (e) {
            contractBoost = 0;
        }

        // 7. Combine all scores, cap at 100
        let finalScore = score + endorsementBoost + contractBoost;
        if (finalScore > 100) finalScore = 100;

        // 8. Cache and return
        await this.cache.set(userId, jobId, finalScore);
        return finalScore;
    }

    // Naive skill extraction from job description (to be replaced with NLP or structured field)
    private extractSkillsFromDescription(description: string): string[] {
        if (!description) return [];
        // Example: split by commas and common delimiters
        return description
            .split(/[,.;\n]/)
            .map(s => s.trim().toLowerCase())
            .filter(s => s.length > 1 && s.length < 50);
    }

    // Cosine similarity between two string arrays of skills (case-insensitive)
    private computeCosineSimilarity(userSkills: string[], jobSkills: string[]): number {
        if (!userSkills.length || !jobSkills.length) return 0;
        const allSkills = Array.from(new Set([...userSkills.map(s => s.toLowerCase()), ...jobSkills.map(s => s.toLowerCase())]));
        const userVec = allSkills.map(skill => userSkills.map(s => s.toLowerCase()).includes(skill) ? 1 : 0);
        const jobVec = allSkills.map(skill => jobSkills.map(s => s.toLowerCase()).includes(skill) ? 1 : 0);
        const dot = userVec.reduce((sum: number, val, i) => sum + val * jobVec[i], 0);
        const normA = Math.sqrt(userVec.reduce((sum: number, val) => sum + val * val, 0));
        const normB = Math.sqrt(jobVec.reduce((sum: number, val) => sum + val * val, 0));
        if (normA === 0 || normB === 0) return 0;
        // Scale to 0-100
        return Math.round((dot / (normA * normB)) * 100);
    }
}
