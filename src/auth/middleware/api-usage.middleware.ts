import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricType } from '@src/analytics/enums/metric-types.enum';
import { AnalyticsService } from '@src/analytics/analytic.service';


@Injectable()
export class ApiUsageMiddleware implements NestMiddleware {
  constructor(private readonly analyticsService: AnalyticsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      // Record API usage metric
      this.analyticsService.recordMetric({
        type: MetricType.API_REQUEST,
        value: duration,
        metadata: {
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          contentLength: res.get('content-length') || 0,
        },
      }).catch(err => console.error('Error recording API metric:', err));
    });
    
    next();
  }
}