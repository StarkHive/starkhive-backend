import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AnonymizationService } from '../services/anonymization.service';

@Injectable()
export class AnonymizationMiddleware implements NestMiddleware {
  constructor(private readonly anonymizationService: AnonymizationService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.json;
    
    res.json = ((data: any) => {
      // Check if response needs anonymization
      const context = req.headers['x-data-context'] as string;
      
      if (this.anonymizationService.shouldAnonymize(context)) {
        // Handle array of users
        if (Array.isArray(data) && data[0]?.email) {
          return originalSend.call(res, this.anonymizationService.anonymizeUsers(data));
        }
        // Handle single user
        if (data?.email) {
          return originalSend.call(res, this.anonymizationService.anonymizeUser(data));
        }
      }
      
      return originalSend.call(res, data);
    }) as Response['json'];

    next();
  }
}
