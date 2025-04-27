import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ValidationService } from '../validation.service';

@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  constructor(private readonly validationService: ValidationService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    try {
      // Sanitize request body
      if (req.body) {
        req.body = this.validationService.sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (req.query) {
        const sanitizedQuery = this.validationService.sanitizeObject(req.query);
        // Preserve the object reference
        Object.keys(req.query).forEach(key => delete req.query[key]);
        Object.assign(req.query, sanitizedQuery);
      }

      // Sanitize URL parameters
      if (req.params) {
        const sanitizedParams = this.validationService.sanitizeObject(req.params);
        // Preserve the object reference
        Object.keys(req.params).forEach(key => delete req.params[key]);
        Object.assign(req.params, sanitizedParams);
      }

      next();
    } catch (error) {
      console.error('Error in SanitizationMiddleware:', error);
      next(error);
    }
  }
}
