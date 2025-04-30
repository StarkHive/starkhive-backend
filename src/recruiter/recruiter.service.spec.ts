import { Test, TestingModule } from '@nestjs/testing';
import { RecruiterService } from './recruiter.service';

describe('RecruiterService', () => {
  let service: RecruiterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecruiterService],
    }).compile();

    service = module.get<RecruiterService>(RecruiterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
