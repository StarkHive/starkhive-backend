import { Test, TestingModule } from '@nestjs/testing';
import { ProofOfWorkService } from './proof-of-work.service';

describe('ProofOfWorkService', () => {
  let service: ProofOfWorkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProofOfWorkService],
    }).compile();

    service = module.get<ProofOfWorkService>(ProofOfWorkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
