import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import csv from 'csvtojson';
import { BulkUserImportDto, ImportResultDto } from '../dto/bulk-import.dto';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class UserImportService {
  private readonly logger = new Logger(UserImportService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService
  ) {}

  async importUsers(file: Express.Multer.File): Promise<ImportResultDto> {
    this.logger.log('Starting user import process');
    
    if (!file) {
      throw new InternalServerErrorException('No file uploaded');
    }

    this.logger.log(`File Details:
      - Original Name: ${file.originalname}
      - Mime Type: ${file.mimetype}
      - Size: ${file.size} bytes
    `);

    try {
      let users: any[];

      // Parsing based on file type
      if (file.mimetype === 'text/csv') {
        users = await this.parseCsv(file);
      } else if (file.mimetype === 'application/json') {
        users = this.parseJson(file);
      } else {
        throw new Error(`Unsupported file type: ${file.mimetype}`);
      }

      // Import process
      const result: ImportResultDto = {
        totalRecords: users.length,
        successfulImports: 0,
        failedImports: 0,
        errors: []
      };

      for (const userData of users) {
        try {
          // Check if user exists
          const existingUser = await this.userRepository.findOne({ 
            where: { email: userData.email } 
          });

          if (existingUser) {
            // Update existing user
            Object.assign(existingUser, userData);
            await this.userRepository.save(existingUser);
          } else {
            // Create new user
            const newUser = this.userRepository.create(userData);
            await this.userRepository.save(newUser);
          }

          result.successfulImports++;
        } catch (userImportError) {
          this.logger.error(`Failed to import user: ${userData.email}`, userImportError);
          result.failedImports++;
          const errorMessage = userImportError instanceof Error ? userImportError.message : 'Unknown error';
          result.errors.push(`Failed to import user ${userData.email}: ${errorMessage}`);
        }
      }

      this.logger.log(`Import completed: 
        Total Records: ${result.totalRecords}
        Successful: ${result.successfulImports}
        Failed: ${result.failedImports}
      `);

      return result;
    } catch (error) {
      this.logger.error('Import process failed', error);
      throw new InternalServerErrorException('Failed to process import file');
    }
  }

  private async parseCsv(file: Express.Multer.File): Promise<any[]> {
    try {
      return await csv().fromString(file.buffer.toString('utf-8'));
    } catch (error) {
      this.logger.error('CSV parsing failed', error);
      throw new Error('Invalid CSV format');
    }
  }

  private parseJson(file: Express.Multer.File): any[] {
    try {
      return JSON.parse(file.buffer.toString('utf-8'));
    } catch (error) {
      this.logger.error('JSON parsing failed', error);
      throw new Error('Invalid JSON format');
    }
  }
}