import { Test, TestingModule } from '@nestjs/testing';
import { ReputationRepository } from './Reputation Repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reputation } from './reputation.entity';
import { Repository } from 'typeorm';

describe('ReputationRepository', () => {
    let repository: ReputationRepository;
    let mockRepo: Partial<Repository<Reputation>>;

    beforeEach(async () => {
        mockRepo = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReputationRepository,
                {
                    provide: getRepositoryToken(Reputation),
                    useValue: mockRepo,
                },
            ],
        }).compile();

        repository = module.get<ReputationRepository>(ReputationRepository);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('getReputationByUserId', () => {
        it('should return reputation if found', async () => {
            const mockReputation: Reputation = {
                id: 1,
                user: { id: '1' } as any, 
                rating: 4.5,
                completedJobs: 2,
                verificationStatus: true,
                createdAt: new Date(),
                lastUpdated: new Date(),
            };

            jest.spyOn(mockRepo, 'findOne').mockResolvedValue(mockReputation);

            const result = await repository.getReputationByUserId(1);
            expect(result).toEqual(mockReputation);
        });

        it('should return null if reputation is not found', async () => {
            jest.spyOn(mockRepo, 'findOne').mockResolvedValue(null);
            const result = await repository.getReputationByUserId(2);
            expect(result).toBeNull();
        });
    });

    describe('updateReputation', () => {
        it('should create new reputation if not found', async () => {
            jest.spyOn(mockRepo, 'findOne').mockResolvedValue(null);
            const mockSave = jest.spyOn(mockRepo, 'save').mockResolvedValue({
                id: 1,
                user: { id: '1' } as any,
                completedJobs: 1,
                rating: 5,
                verificationStatus: false,
                createdAt: new Date(),
                lastUpdated: new Date(),
            });

            const result = await repository.updateReputation(1, 5);
            expect(mockSave).toHaveBeenCalled();
            expect(result.completedJobs).toBe(1);
        });

        it('should update existing reputation', async () => {
            const existingReputation: Reputation = {
                id: 1,
                user: { id: '1' } as any,
                rating: 4.0,
                completedJobs: 2,
                verificationStatus: false,
                createdAt: new Date(),
                lastUpdated: new Date(),
            };

            jest.spyOn(mockRepo, 'findOne').mockResolvedValue(existingReputation);
            const mockSave = jest.spyOn(mockRepo, 'save').mockResolvedValue({
                ...existingReputation,
                rating: 4.33,
                completedJobs: 3,
            });

            const result = await repository.updateReputation(1, 5);
            expect(mockSave).toHaveBeenCalled();
            expect(result.completedJobs).toBe(3);
        });
    });

    describe('verifyUser', () => {
        it('should set verificationStatus to true', async () => {
            const mockReputation: Reputation = {
                id: 1,
                user: { id: '1' } as any,
                verificationStatus: false,
                rating: 4.5,
                completedJobs: 2,
                createdAt: new Date(),
                lastUpdated: new Date(),
            };

            jest.spyOn(mockRepo, 'findOne').mockResolvedValue(mockReputation);
            const mockSave = jest.spyOn(mockRepo, 'save').mockResolvedValue({
                ...mockReputation,
                verificationStatus: true,
            });

            const result = await repository.verifyUser(1);
            expect(mockSave).toHaveBeenCalled();
            expect(result.verificationStatus).toBe(true);
        });

        it('should throw an error if reputation is not found', async () => {
            jest.spyOn(mockRepo, 'findOne').mockResolvedValue(null);
            await expect(repository.verifyUser(2)).rejects.toThrow('User reputation not found');
        });
    });
});
