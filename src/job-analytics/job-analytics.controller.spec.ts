import { Test, TestingModule } from '@nestjs/testing';
import { JobAnalyticsController } from './job-analytics.controller';
import { JobAnalyticsService } from './job-analytics.service';

describe('JobAnalyticsController', () => {
  let controller: JobAnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobAnalyticsController],
      providers: [JobAnalyticsService],
    }).compile();

    controller = module.get<JobAnalyticsController>(JobAnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
