import { Test, TestingModule } from '@nestjs/testing';
import { ProofOfWorkController } from './proof-of-work.controller';
import { ProofOfWorkService } from './proof-of-work.service';

describe('ProofOfWorkController', () => {
  let controller: ProofOfWorkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProofOfWorkController],
      providers: [ProofOfWorkService],
    }).compile();

    controller = module.get<ProofOfWorkController>(ProofOfWorkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
