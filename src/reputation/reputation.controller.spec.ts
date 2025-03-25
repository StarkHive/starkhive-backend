import { Test, TestingModule } from '@nestjs/testing';
import { ReputationController } from './reputation.controller';

describe('ReputationController', () => {
  let controller: ReputationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReputationController],
    }).compile();

    controller = module.get<ReputationController>(ReputationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
