import { Test, TestingModule } from '@nestjs/testing';
import { ReputationRepository } from './ReputationRepository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reputation } from './Reputation.entity';

describe('ReputationRepository', () => {
  let repository: ReputationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReputationRepository,
        {
          provide: getRepositoryToken(Reputation),
          useValue: {
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            findOne: jest
              .fn()
              .mockResolvedValue({ id: 1, completedJobs: 1, rating: 4.5 }),
            updateReputation: jest.fn().mockResolvedValue({
              id: 1,
              completedJobs: 1,
              rating: 4.5,
            }),
          },
        },
      ],
    }).compile();

    repository = module.get<ReputationRepository>(ReputationRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should update reputation correctly', async () => {
    const result = await repository.updateReputation(1, 4.5);
    expect(result.completedJobs).toBeGreaterThanOrEqual(1);
  });
});
