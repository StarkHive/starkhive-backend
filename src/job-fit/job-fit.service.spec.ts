import { Test, TestingModule } from '@nestjs/testing';
import { JobFitService } from './job-fit.service';
import { JobFitCache } from './job-fit.cache';
import { FreelancerProfileService } from '../freelancer-profile/freelancer-profile.service';
import { JobPostingsService } from '../job-postings/job-postings.service';
import { EndorsementService } from '../endorsement/endorsement.service';
import { ContractService } from '../contract/contract.service';

// Mocks
const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
};
const mockFreelancerProfileService = {
    getProfileByUserId: jest.fn(),
};
const mockJobPostingsService = {
    findOne: jest.fn(),
};
const mockEndorsementService = {
    getEndorsementsForProfile: jest.fn(),
};
const mockContractService = {
    findByUserId: jest.fn(),
};

describe('JobFitService', () => {
    let service: JobFitService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JobFitService,
                { provide: JobFitCache, useValue: mockCache },
                { provide: FreelancerProfileService, useValue: mockFreelancerProfileService },
                { provide: JobPostingsService, useValue: mockJobPostingsService },
                { provide: EndorsementService, useValue: mockEndorsementService },
                { provide: ContractService, useValue: mockContractService },
            ],
        }).compile();
        service = module.get<JobFitService>(JobFitService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('returns 0 if user profile not found', async () => {
        mockCache.get.mockResolvedValueOnce(null);
        mockFreelancerProfileService.getProfileByUserId.mockResolvedValueOnce(null);
        await expect(service.computeJobFitScore('user1', 'job1')).rejects.toThrow('User profile not found');
    });

    it('returns 0 if job posting not found', async () => {
        mockCache.get.mockResolvedValueOnce(null);
        mockFreelancerProfileService.getProfileByUserId.mockResolvedValueOnce({ id: 1, skills: ['js'] });
        mockJobPostingsService.findOne.mockResolvedValueOnce(null);
        await expect(service.computeJobFitScore('user1', 'job1')).rejects.toThrow('Job posting not found');
    });

    it('returns cached score if present', async () => {
        mockCache.get.mockResolvedValueOnce(42);
        const score = await service.computeJobFitScore('user1', 'job1');
        expect(score).toBe(42);
    });

    it('computes score using cosine similarity', async () => {
        mockCache.get.mockResolvedValueOnce(null);
        mockFreelancerProfileService.getProfileByUserId.mockResolvedValueOnce({ id: 1, skills: ['js', 'node'] });
        mockJobPostingsService.findOne.mockResolvedValueOnce({ description: 'js,node' });
        mockEndorsementService.getEndorsementsForProfile.mockResolvedValueOnce([]);
        mockContractService.findByUserId.mockResolvedValueOnce([]);
        mockCache.set.mockResolvedValueOnce(undefined);
        const score = await service.computeJobFitScore('user1', '1');
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(100);
    });

    it('boosts score for endorsements', async () => {
        mockCache.get.mockResolvedValueOnce(null);
        mockFreelancerProfileService.getProfileByUserId.mockResolvedValueOnce({ id: 1, skills: ['js', 'node'] });
        mockJobPostingsService.findOne.mockResolvedValueOnce({ description: 'js,node' });
        mockEndorsementService.getEndorsementsForProfile.mockResolvedValueOnce([
            { skill: 'js' },
            { skill: 'js' },
            { skill: 'js' },
        ]);
        mockContractService.findByUserId.mockResolvedValueOnce([]);
        mockCache.set.mockResolvedValueOnce(undefined);
        const score = await service.computeJobFitScore('user1', '1');
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(100);
    });

    it('boosts score for relevant contracts', async () => {
        mockCache.get.mockResolvedValueOnce(null);
        mockFreelancerProfileService.getProfileByUserId.mockResolvedValueOnce({ id: 1, skills: ['js', 'node'] });
        mockJobPostingsService.findOne.mockResolvedValueOnce({ description: 'js,node' });
        mockEndorsementService.getEndorsementsForProfile.mockResolvedValueOnce([]);
        mockContractService.findByUserId.mockResolvedValueOnce([
            { jobPosting: { description: 'js,node' } },
        ]);
        mockCache.set.mockResolvedValueOnce(undefined);
        const score = await service.computeJobFitScore('user1', '1');
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(100);
    });

    it('caps score at 100', async () => {
        mockCache.get.mockResolvedValueOnce(null);
        mockFreelancerProfileService.getProfileByUserId.mockResolvedValueOnce({ id: 1, skills: ['js', 'node'] });
        mockJobPostingsService.findOne.mockResolvedValueOnce({ description: 'js,node' });
        mockEndorsementService.getEndorsementsForProfile.mockResolvedValueOnce([
            { skill: 'js' }, { skill: 'js' }, { skill: 'js' },
            { skill: 'node' }, { skill: 'node' }, { skill: 'node' },
        ]);
        mockContractService.findByUserId.mockResolvedValueOnce([
            { jobPosting: { description: 'js,node' } },
            { jobPosting: { description: 'js,node' } },
        ]);
        mockCache.set.mockResolvedValueOnce(undefined);
        const score = await service.computeJobFitScore('user1', '1');
        expect(score).toBeLessThanOrEqual(100);
    });
});
