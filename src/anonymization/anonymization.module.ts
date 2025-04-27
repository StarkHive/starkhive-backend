import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AnonymizationService } from './services/anonymization.service';
import { AnonymizationMiddleware } from './middleware/anonymization.middleware';
import { AnonymizationController } from './controllers/anonymization.controller';

@Module({
  providers: [AnonymizationService],
  exports: [AnonymizationService],
  controllers: [AnonymizationController],
})
export class AnonymizationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply anonymization middleware to specific routes
    consumer
      .apply(AnonymizationMiddleware)
      .forRoutes(
        'users/search',
        'users/export',
        'reports/*'
      );
  }
}
