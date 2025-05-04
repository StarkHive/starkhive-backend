import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeerReview } from './entities/peer-review.entity';

@Injectable()
export class PeerReviewService {
  constructor(
    @InjectRepository(PeerReview)
    private readonly reviewRepo: Repository<PeerReview>,
  ) {}

  async submitReview(data: {
    reviewerId: string;
    proofId: string;
    rating: number;
    comment: string;
  }) {
    const review = this.reviewRepo.create(data);
    return this.reviewRepo.save(review);
  }

  async getAggregatedRating(proofId: string) {
    const reviews = await this.reviewRepo.find({ where: { proofId } });
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = reviews.length ? total / reviews.length : 0;
    return {
      average,
      totalReviews: reviews.length,
      reviews,
    };
  }
}
