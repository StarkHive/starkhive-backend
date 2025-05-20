import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as pdfParse from 'pdf-parse';
import { PreviewResult } from '../interfaces/preview-result.interface';
import { DocumentType } from '../enums/document-type.enum';
import * as path from 'path';

@Injectable()
export class PdfProcessorService {
  private readonly logger = new Logger(PdfProcessorService.name);

  /**
   * Generate a preview for a PDF document
   * @param filePath Path to the PDF file
   */
  async generatePreview(filePath: string): Promise<PreviewResult> {
    try {
      this.logger.log(`Generating preview for PDF: ${filePath}`);
      
      // Read the PDF file
      const dataBuffer = await fs.readFile(filePath);
      
      // Parse the PDF
      const pdfData = await pdfParse(dataBuffer);
      
      // Extract metadata and text content
      const textContent = pdfData.text;
      const pageCount = pdfData.numpages;
      const metadata = {
        author: pdfData.info.Author || 'Unknown',
        creationDate: pdfData.info.CreationDate,
        title: pdfData.info.Title || path.basename(filePath),
      };

      // In a real implementation, you would generate the preview image here
      // For now, we'll just simulate this
      const previewUrl = `/previews/${path.basename(filePath)}.png`;
      const thumbnailUrl = `/thumbnails/${path.basename(filePath)}.png`;

      return {
        id: path.basename(filePath),
        documentType: DocumentType.PDF,
        previewUrl,
        thumbnailUrl,
        textContent,
        pageCount,
        metadata,
        createdAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to process PDF: ${error.message}`, error.stack);
      throw new Error(`PDF processing failed: ${error.message}`);
    }
  }
}