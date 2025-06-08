// src/interceptors/retry.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError, retryWhen, scan, delay } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class RetryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const url = request.url;

    return next.handle().pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            const maxRetries = 3;
            if (retryCount >= maxRetries) {
              throw error;
            }
            const backoffTime = Math.pow(2, retryCount) * 1000;
            console.warn(
              `Retrying ${url} [Attempt ${retryCount + 1}] after ${backoffTime}ms...`
            );
            return retryCount + 1;
          }, 0),
          delay(retryCount => Math.pow(2, retryCount) * 1000)
        )
      )
    );
  }
}
