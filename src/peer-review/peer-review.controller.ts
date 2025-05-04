import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PeerReviewService } from './peer-review.service';

@Controller('peer-review')
export class PeerReviewController {
  constructor(private readonly reviewService: PeerReviewService) {}

  @Post()
  async submitReview(
    @Body()
    body: {
      reviewerId: string;
      proofId: string;
      rating: number;
      comment: string;
    },
  ) {
    return this.reviewService.submitReview(body);
  }

  @Get('aggregate')
  async getAggregatedRating(@Query('proofId') proofId: string) {
    return this.reviewService.getAggregatedRating(proofId);
  }
}
