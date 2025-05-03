import { Test, TestingModule } from '@nestjs/testing';
import { ReputationAppealService } from './reputation-appeal.service';

describe('ReputationAppealService', () => {
  let service: ReputationAppealService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReputationAppealService],
    }).compile();

    service = module.get<ReputationAppealService>(ReputationAppealService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
