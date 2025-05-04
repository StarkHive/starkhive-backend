import { Test, TestingModule } from '@nestjs/testing';
import { PeerReviewController } from './peer-review.controller';
import { PeerReviewService } from './peer-review.service';

describe('PeerReviewController', () => {
  let controller: PeerReviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeerReviewController],
      providers: [PeerReviewService],
    }).compile();

    controller = module.get<PeerReviewController>(PeerReviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
