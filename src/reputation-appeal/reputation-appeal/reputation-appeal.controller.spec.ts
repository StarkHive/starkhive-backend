import { Test, TestingModule } from '@nestjs/testing';
import { ReputationAppealController } from './reputation-appeal/reputation-appeal.controller';
import { ReputationAppealService } from './reputation-appeal/reputation-appeal.service';

describe('ReputationAppealController', () => {
  let controller: ReputationAppealController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReputationAppealController],
      providers: [ReputationAppealService],
    }).compile();

    controller = module.get<ReputationAppealController>(ReputationAppealController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
