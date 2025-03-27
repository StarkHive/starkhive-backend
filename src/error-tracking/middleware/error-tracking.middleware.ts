import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ErrorTrackingService } from '../error-tracking.service';
import { ErrorSeverity } from '../entities/error-log.entity';

@Injectable()
export class ErrorTrackingMiddleware implements NestMiddleware {
  constructor(private readonly errorTrackingService: ErrorTrackingService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      await next();
    } catch (error: unknown) {
      let severity = ErrorSeverity.MEDIUM;
      const errorObject = this.normalizeError(error);

      // Determine severity based on error type
      if (error instanceof HttpException) {
        const status = error.getStatus();
        if (status >= 500) {
          severity = ErrorSeverity.HIGH;
        } else if (status === 401 || status === 403) {
          severity = ErrorSeverity.LOW;
        }
      } else {
        // Unhandled errors are considered critical
        severity = ErrorSeverity.CRITICAL;
      }

      // Log the error
      await this.errorTrackingService.logError(errorObject, req, severity);

      // If it's not an HTTP exception, convert it to one
      let httpError: HttpException;
      if (error instanceof HttpException) {
        httpError = error;
      } else {
        httpError = new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Send error response
      const response = httpError.getResponse();
      const status = httpError.getStatus();

      res.status(status).json(
        typeof response === 'string'
          ? { statusCode: status, message: response }
          : response,
      );
    }
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    
    // Convert unknown error to Error object
    const message = error instanceof Object 
      ? JSON.stringify(error)
      : String(error);
    
    return new Error(message);
  }
}
