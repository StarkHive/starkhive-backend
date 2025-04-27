import { Test, TestingModule } from '@nestjs/testing';
import { ValidationService } from '../validation.service';
import { IsString, IsEmail, MinLength } from 'class-validator';

class TestDTO {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidationService],
    }).compile();

    service = module.get<ValidationService>(ValidationService);
  });

  describe('validateAndSanitize', () => {
    it('should validate and sanitize valid data', async () => {
      const testData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await service.validateAndSanitize(testData, TestDTO);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid data', async () => {
      const testData = {
        email: 'invalid-email',
        password: '123', // Too short
      };

      const result = await service.validateAndSanitize(testData, TestDTO);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello<p>World</p>';
      const sanitized = service.sanitizeHtml(input);
      expect(sanitized).toBe('HelloWorld');
    });
  });

  describe('sanitizeSQL', () => {
    it('should remove SQL injection characters', () => {
      const input = "'; DROP TABLE users; --";
      const sanitized = service.sanitizeSQL(input);
      expect(sanitized).not.toContain(';');
      expect(sanitized).not.toContain("'");
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize nested objects', () => {
      const input = {
        name: '<script>alert("xss")</script>',
        details: {
          comment: "'; DROP TABLE users; --",
        },
        tags: ['<p>tag1</p>', '<div>tag2</div>'],
      };

      const sanitized = service.sanitizeObject(input);
      expect(sanitized.name).toBe('');
      expect(sanitized.details.comment).not.toContain(';');
      expect(sanitized.tags[0]).toBe('tag1');
      expect(sanitized.tags[1]).toBe('tag2');
    });
  });
});
