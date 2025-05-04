import { Test, TestingModule } from '@nestjs/testing';
import { PeerReviewService } from './peer-review.service';

describe('PeerReviewService', () => {
  let service: PeerReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeerReviewService],
    }).compile();

    service = module.get<PeerReviewService>(PeerReviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
