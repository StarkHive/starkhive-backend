import { Test, TestingModule } from '@nestjs/testing';
import { JobPostingsService } from './job-postings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting } from './entities/job-posting.entity';

// Create a mock for Repository
class MockJobPostingRepository {
  create = jest.fn().mockReturnValue(true);
  save = jest.fn().mockResolvedValue({
    id: 1,
    title: 'NestJS Dev',
    description: 'Build APIs',
    company: 'Tech Co',
  });
}

describe('JobPostingsService', () => {
  let service: JobPostingsService;
  let repository: MockJobPostingRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobPostingsService,
        {
          provide: getRepositoryToken(JobPosting),
          useClass: MockJobPostingRepository, // Use the mock repository
        },
      ],
    }).compile();

    service = module.get<JobPostingsService>(JobPostingsService);
    repository = module.get<MockJobPostingRepository>(
      getRepositoryToken(JobPosting),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a job', async () => {
    const job = await service.create({
      title: 'NestJS Dev',
      description: 'Build APIs',
      company: 'Tech Co',
    });
    expect(job).toHaveProperty('id');
    expect(repository.create).toHaveBeenCalledWith({
      title: 'NestJS Dev',
      description: 'Build APIs',
      company: 'Tech Co',
    });
  });
});
