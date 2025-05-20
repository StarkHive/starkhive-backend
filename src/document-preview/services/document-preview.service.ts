import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DocumentProcessorService } from './document-processor.service';
import { PreviewResult } from '../interfaces/preview-result.interface';
import { DocumentPreviewDto } from '../dto/document-preview.dto';

@Injectable()
export class DocumentPreviewService {
  private readonly logger = new Logger(DocumentPreviewService.name);

  constructor(
    private readonly documentProcessor: DocumentProcessorService,
  ) {}

  /**
   * Generate a preview for a document
   * @param filePath Path to the document file
   * @param userId ID of the user requesting the preview
   * @param documentId Unique identifier for the document
   */
  async generatePreview(
    filePath: string,
    userId: string,
    documentId: string,
  ): Promise<DocumentPreviewDto> {
    // Check if user has permission to access this document
    const hasAccess = await this.documentProcessor.checkAccessPermission(userId, documentId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to access this document');
    }

    try {
      // Process the document
      const previewResult = await this.documentProcessor.processDocument(
        filePath,
        userId,
        documentId,
      );
      
      return this.mapToPreviewDto(previewResult);
    } catch (error) {
      this.logger.error(`Failed to generate preview: ${error.message}`, error.stack);
      throw new Error(`Preview generation failed: ${error.message}`);
    }
  }

  /**
   * Extract text content from a document for search indexing
   * @param documentId Unique identifier for the document
   * @param userId ID of the user requesting the extraction
   */
  async extractTextForIndexing(documentId: string, userId: string): Promise<string> {
    // Check if user has permission to access this document
    const hasAccess = await this.documentProcessor.checkAccessPermission(userId, documentId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to access this document');
    }

    try {
      return await this.documentProcessor.extractTextForIndexing(documentId);
    } catch (error) {
      this.logger.error(`Failed to extract text: ${error.message}`, error.stack);
      throw new NotFoundException(`Document preview not found: ${documentId}`);
    }
  }

  /**
   * Map internal preview results to DTOs for API responses
   */
  private mapToPreviewDto(previewResult: PreviewResult): DocumentPreviewDto {
    return {
      id: previewResult.id,
      documentType: previewResult.documentType,
      previewUrl: previewResult.previewUrl,
      thumbnailUrl: previewResult.thumbnailUrl,
      pageCount: previewResult.pageCount,
      metadata: previewResult.metadata,
      textPreview: this.truncateText(previewResult.textContent, 200),
      createdAt: previewResult.createdAt,
    };
  }

  /**
   * Truncate text to a specified length
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }
}