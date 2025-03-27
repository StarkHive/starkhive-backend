import {
  Injectable,
  NestMiddleware,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimitingService } from './rate-limiting.service';

@Injectable()
export class RateLimitingMiddleware implements NestMiddleware {
  constructor(private readonly rateLimitingService: RateLimitingService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Get the real IP, fallback to a default if not available
    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
    const endpoint = req.path;
    const user = (req as any).user; // From JWT auth middleware

    try {
      const result = await this.rateLimitingService.checkRateLimit(
        ip,
        endpoint,
        user?.id,
        user?.isPremium,
      );

      // Set rate limit headers
      res.header('X-RateLimit-Limit', result.remaining.toString());
      res.header('X-RateLimit-Remaining', result.remaining.toString());
      res.header('X-RateLimit-Reset', result.resetTime.toString());

      if (!result.allowed) {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Rate limit exceeded',
            retryAfter: Math.ceil(result.resetTime / 1000), // Convert to seconds
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Log unexpected errors and continue
      console.error('Rate limiting error:', error);
      next();
    }
  }
}
