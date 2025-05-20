import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as mammoth from 'mammoth';
import * as xlsx from 'node-xlsx';
import * as path from 'path';
import { PreviewResult } from '../interfaces/preview-result.interface';
import { DocumentType } from '../enums/document-type.enum';

@Injectable()
export class OfficeProcessorService {
  private readonly logger = new Logger(OfficeProcessorService.name);

  /**
   * Generate a preview for Office documents
   * @param filePath Path to the Office file
   * @param documentType Type of Office document
   */
  async generatePreview(
    filePath: string,
    documentType: DocumentType,
  ): Promise<PreviewResult> {
    try {
      this.logger.log(`Generating preview for ${documentType} document: ${filePath}`);
      
      let textContent: string;
      let metadata: Record<string, any> = {};
      
      // Process based on document type
      if (documentType === DocumentType.WORD) {
        // Process Word document
        const dataBuffer = await fs.readFile(filePath);
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        textContent = result.value;
        
        // Extract metadata - in a real implementation, you'd use a library 
        // that can extract metadata from Word documents
        metadata = {
          title: path.basename(filePath),
        };
      } else if (documentType === DocumentType.EXCEL) {
        // Process Excel document
        const workSheets = xlsx.parse(filePath);
        
        // Combine all sheets into a text representation
        textContent = workSheets
          .map(sheet => {
            const sheetName = sheet.name;
            const sheetData = sheet.data
              .map(row => row.join('\t'))
              .join('\n');
            
            return `Sheet: ${sheetName}\n${sheetData}`;
          })
          .join('\n\n');
        
        metadata = {
          title: path.basename(filePath),
          sheetCount: workSheets.length,
        };
      } else {
        throw new Error(`Unsupported document type: ${documentType}`);
      }

      // In a real implementation, you would generate preview images here
      const previewUrl = `/previews/${path.basename(filePath)}.png`;
      const thumbnailUrl = `/thumbnails/${path.basename(filePath)}.png`;

      return {
        id: path.basename(filePath),
        documentType,
        previewUrl,
        thumbnailUrl,
        textContent,
        metadata,
        createdAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to process Office document: ${error.message}`, error.stack);
      throw new Error(`Office document processing failed: ${error.message}`);
    }
  }
}