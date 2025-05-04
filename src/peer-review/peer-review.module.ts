import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeerReviewService } from './peer-review.service';
import { PeerReviewController } from './peer-review.controller';
import { PeerReview } from './entities/peer-review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PeerReview])],
  providers: [PeerReviewService],
  controllers: [PeerReviewController],
})
export class PeerReviewModule {}
