import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { RecommendationRequest } from './entities/recommendation-request.entity';
import { RecommendationsService } from './services/recommendations.service';
import { RecommendationRequestsService } from './services/recommendation-requests.service';
import { RecommendationsController } from './controllers/recommendations.controller';
import { RecommendationRequestsController } from './controllers/recommendation-requests.controller';
import { UserModule } from '@src/user/user.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recommendation, RecommendationRequest]),
    UserModule,
    NotificationsModule,
  ],
  controllers: [RecommendationsController, RecommendationRequestsController],
  providers: [RecommendationsService, RecommendationRequestsService],
  exports: [RecommendationsService, RecommendationRequestsService],
})
export class RecommendationsModule {}
