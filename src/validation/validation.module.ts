import { Module, Global, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { SanitizationMiddleware } from './middleware/sanitization.middleware';

@Global()
@Module({
  providers: [ValidationService, SanitizationMiddleware],
  exports: [ValidationService],
})
export class ValidationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SanitizationMiddleware).forRoutes('*');
  }
}
