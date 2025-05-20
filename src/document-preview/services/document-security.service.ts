import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as fileType from 'file-type';

@Injectable()
export class DocumentSecurityService {
  private readonly logger = new Logger(DocumentSecurityService.name);
  private readonly maxFileSizeBytes = 50 * 1024 * 1024; // 50MB
  private readonly allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  /**
   * Scan a document for security issues
   * @param filePath Path to the document file
   * @throws Error if the document fails security checks
   */
  async scanDocument(filePath: string): Promise<void> {
    try {
      this.logger.log(`Scanning document for security issues: ${filePath}`);
      
      // Check file size
      const stats = await fs.stat(filePath);
      if (stats.size > this.maxFileSizeBytes) {
        throw new Error('File exceeds maximum allowed size');
      }
      
      // Check file type
      const fileBuffer = await fs.readFile(filePath);
      const fileInfo = await fileType.fromBuffer(fileBuffer);
      
      if (!fileInfo || !this.allowedMimeTypes.includes(fileInfo.mime)) {
        throw new Error(`File type ${fileInfo?.mime || 'unknown'} is not allowed`);
      }
      
      // In a real implementation, you might integrate with a virus scanning API
      // or perform more detailed security checks here
      
      this.logger.log(`Document passed security checks: ${filePath}`);
    } catch (error) {
      this.logger.error(`Security scan failed: ${error.message}`, error.stack);
      throw new Error(`Security scan failed: ${error.message}`);
    }
  }

  /**
   * Sanitize a file name to prevent path traversal and other attacks
   * @param fileName Original file name
   * @returns Sanitized file name
   */
  sanitizeFileName(fileName: string): string {
    // Remove any path traversal attempts and normalize the name
    const sanitized = fileName
      .replace(/\.\./g, '')
      .replace(/[/\\]/g, '')
      .trim();
    
    return sanitized || 'unnamed_document';
  }
}