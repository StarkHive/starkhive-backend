import { Test, TestingModule } from '@nestjs/testing';
import { EndorsementService } from './endorsement.service';

describe('EndorsementService', () => {
  let service: EndorsementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EndorsementService],
    }).compile();

    service = module.get<EndorsementService>(EndorsementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
