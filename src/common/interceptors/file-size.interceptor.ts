import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FileSizeInterceptor implements NestInterceptor {
  constructor(private readonly maxSize: number) {} // in bytes

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    // Check if file exists
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Check file size
    if (file.size > this.maxSize) {
      throw new BadRequestException(
        `File size exceeds the maximum allowed size of ${this.maxSize / (1024 * 1024)} MB`,
      );
    }

    return next.handle();
  }
}