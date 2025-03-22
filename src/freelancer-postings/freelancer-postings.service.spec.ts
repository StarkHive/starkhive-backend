import { Test, TestingModule } from '@nestjs/testing';
import { FreelancerPostingsService } from './freelancer-postings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FreelancerPosting } from './entities/freelancer-posting.entity';

describe('FreelancerPostingsService', () => {
  let service: FreelancerPostingsService;
  let repo: Repository<FreelancerPosting>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FreelancerPostingsService,
        {
          provide: getRepositoryToken(FreelancerPosting),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<FreelancerPostingsService>(FreelancerPostingsService);
    repo = module.get<Repository<FreelancerPosting>>(getRepositoryToken(FreelancerPosting));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a freelancer', async () => {
    const freelancerData = {
      name: 'John Doe',
      email: 'john.doe@example.com', 
      skills: ['NestJS', 'TypeScript'],
      yearsOfExperience: 5, 
      availability: 'Full-time',
      location: 'New York',
      createdAt: new Date(),
    };

    const savedFreelancer = { id: 1, ...freelancerData };

    jest.spyOn(repo, 'create').mockReturnValue(savedFreelancer as any);
    jest.spyOn(repo, 'save').mockResolvedValue(savedFreelancer);

    const result = await service.create(freelancerData);
    expect(result).toEqual(savedFreelancer);
  });
});
