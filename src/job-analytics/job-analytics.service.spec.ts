import { Test, TestingModule } from '@nestjs/testing';
import { JobAnalyticsService } from './job-analytics.service';

describe('JobAnalyticsService', () => {
  let service: JobAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobAnalyticsService],
    }).compile();

    service = module.get<JobAnalyticsService>(JobAnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
