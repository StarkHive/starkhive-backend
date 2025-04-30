import { Test, TestingModule } from '@nestjs/testing';
import { ProposalModerationService } from './proposal-moderation.service';

describe('ProposalModerationService', () => {
  let service: ProposalModerationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProposalModerationService],
    }).compile();

    service = module.get<ProposalModerationService>(ProposalModerationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
