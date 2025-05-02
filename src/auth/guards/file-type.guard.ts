import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FileTypeGuard implements CanActivate {
  constructor(private readonly allowedMimeTypes: string[]) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    // Check if file exists
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Check if file type is allowed
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    return true;
  }
}