import { Test, TestingModule } from '@nestjs/testing';
import { JobPostingsService } from './job-postings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting } from './entities/job-posting.entity';

describe('JobPostingsService', () => {
  let service: JobPostingsService;
  let repository: Repository<JobPosting>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobPostingsService,
        {
          provide: getRepositoryToken(JobPosting), // Mock the repository
          useClass: Repository, // Use a TypeORM repository mock
        },
      ],
    }).compile();

    service = module.get<JobPostingsService>(JobPostingsService);
    repository = module.get<Repository<JobPosting>>(
      getRepositoryToken(JobPosting),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
