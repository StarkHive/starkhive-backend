import { Test, TestingModule } from '@nestjs/testing';
import { JobPostingsController } from './job-postings.controller';
import { JobPostingsService } from './job-postings.service';

// Mock service
const mockJobPostingsService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('JobPostingsController', () => {
  let controller: JobPostingsController;
  let service: jest.Mocked<JobPostingsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobPostingsController],
      providers: [
        {
          provide: JobPostingsService,
          useValue: mockJobPostingsService(),
        },
      ],
    }).compile();

    controller = module.get<JobPostingsController>(JobPostingsController);
    service = module.get(JobPostingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
