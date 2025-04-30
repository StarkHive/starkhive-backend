import { Injectable } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { escape } from 'validator';

@Injectable()
export class ValidationService {
  async validateAndSanitize<T extends object>(dto: any, dtoClass: new () => T): Promise<{ isValid: boolean; errors: string[]; sanitizedData: T }> {
    // Convert plain object to class instance
    const dtoObject = plainToClass(dtoClass, dto);

    // Sanitize string fields
    this.sanitizeObject(dtoObject);

    // Validate the object
    const errors = await validate(dtoObject as object, {
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw errors on unknown properties
      forbidUnknownValues: true,
    });

    if (errors.length > 0) {
      const errorMessages = errors.map(error => 
        Object.values(error.constraints || {}).join(', ')
      );
      return { isValid: false, errors: errorMessages, sanitizedData: dtoObject };
    }

    return { isValid: true, errors: [], sanitizedData: dtoObject };
  }

  sanitizeHtml(input: string): string {
    if (typeof input !== 'string') return input;
    return escape(input);
  }

  sanitizeSQL(input: string): string {
    if (typeof input !== 'string') return input;
    // Basic SQL injection prevention
    return input.replace(/['";\\]/g, '');
  }

  sanitizeObject(obj: any): Record<string, any> {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sanitized: Record<string, any> = Array.isArray(obj) ? [] : {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeHtml(this.sanitizeSQL(value));
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => this.sanitizeObject(item));
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
