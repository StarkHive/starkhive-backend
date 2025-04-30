import { Test, TestingModule } from '@nestjs/testing';
import { ProposalModerationController } from './proposal-moderation.controller';
import { ProposalModerationService } from './proposal-moderation.service';

describe('ProposalModerationController', () => {
  let controller: ProposalModerationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProposalModerationController],
      providers: [ProposalModerationService],
    }).compile();

    controller = module.get<ProposalModerationController>(ProposalModerationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
