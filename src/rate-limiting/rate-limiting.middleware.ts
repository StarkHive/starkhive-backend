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
    // Retrieve user data from previous authentication middleware, if available
    const user = (req as any).user || { id: null, isPremium: false };

    try {
      const {
        allowed,
        limit,
        remaining,
        resetTime,
      } = await this.rateLimitingService.checkRateLimit(
        ip,
        endpoint,
        user.id,
        user.isPremium,
      );

      // Set rate limit headers with clear names
      res.set({
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTime.toString(),
      });

      if (!allowed) {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Rate limit exceeded',
            retryAfter: Math.ceil(resetTime / 1000), // Convert milliseconds to seconds
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      next();
    } catch (error) {
      // If it's an HTTP exception, pass it along
      if (error instanceof HttpException) {
        return next(error);
      }
      // Log unexpected errors with context
      console.error(
        `Rate limiting error for IP: ${ip} on endpoint: ${endpoint} - `,
        error,
      );
      next(error);
    }
  }
}
