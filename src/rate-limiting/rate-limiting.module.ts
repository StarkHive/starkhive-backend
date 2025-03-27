import { Module, Global } from '@nestjs/common';
import { RateLimitingService } from './rate-limiting.service';
import { ConfigModule } from '@nestjs/config';
import rateLimitConfig from './rate-limiting.config';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(() => ({
      rateLimit: rateLimitConfig,
    })),
  ],
  providers: [RateLimitingService],
  exports: [RateLimitingService],
})
export class RateLimitingModule {}
