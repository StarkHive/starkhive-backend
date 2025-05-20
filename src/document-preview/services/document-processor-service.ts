import { Injectable, Logger } from '@nestjs/common';
import { PdfProcessorService } from './pdf-processor.service';
import { OfficeProcessorService } from './office-processor.service';
import { DocumentCacheService } from './document-cache.service';
import { DocumentSecurityService } from './document-security.service';
import { PreviewResult } from '../interfaces/preview-result.interface';
import { DocumentType } from '../enums/document-type.enum';

@Injectable()
export class DocumentProcessorService {
  private readonly logger = new Logger(DocumentProcessorService.name);

  constructor(
    private readonly pdfProcessor: PdfProcessorService,
    private readonly officeProcessor: OfficeProcessorService,
    private readonly cacheService: DocumentCacheService,
    private readonly securityService: DocumentSecurityService,
  ) {}

  /**
   * Process a document file and generate a preview
   * @param filePath Path to the document file
   * @param userId ID of the user requesting the preview
   * @param documentId Unique identifier for the document
   */
  async processDocument(
    filePath: string,
    userId: string,
    documentId: string,
  ): Promise<PreviewResult> {
    try {
      // Check if preview is already cached
      const cachedPreview = await this.cacheService.getPreview(documentId);
      if (cachedPreview) {
        this.logger.log(`Retrieved cached preview for document ${documentId}`);
        return cachedPreview;
      }

      // Perform security scan before processing
      await this.securityService.scanDocument(filePath);

      // Determine document type
      const documentType = await this.determineDocumentType(filePath);

      // Process based on document type
      let result: PreviewResult;
      switch (documentType) {
        case DocumentType.PDF:
          result = await this.pdfProcessor.generatePreview(filePath);
          break;
        case DocumentType.WORD:
        case DocumentType.EXCEL:
          result = await this.officeProcessor.generatePreview(filePath, documentType);
          break;
        default:
          throw new Error(`Unsupported document type: ${documentType}`);
      }

      // Cache the preview result
      await this.cacheService.storePreview(documentId, result);

      return result;
    } catch (error) {
      this.logger.error(`Failed to process document: ${error.message}`, error.stack);
      throw new Error(`Document processing failed: ${error.message}`);
    }
  }

  /**
   * Determine the type of document based on file extension and content
   */
  private async determineDocumentType(filePath: string): Promise<DocumentType> {
    const fileExtension = filePath.split('.').pop().toLowerCase();
    
    switch (fileExtension) {
      case 'pdf':
        return DocumentType.PDF;
      case 'doc':
      case 'docx':
        return DocumentType.WORD;
      case 'xls':
      case 'xlsx':
        return DocumentType.EXCEL;
      default:
        throw new Error(`Unsupported file extension: ${fileExtension}`);
    }
  }

  /**
   * Check if user has permission to access the document
   */
  async checkAccessPermission(userId: string, documentId: string): Promise<boolean> {
    // In a real application, this would check against a database
    // For now, we'll just return true for demonstration
    return true;
  }

  /**
   * Extract text content for search indexing
   */
  async extractTextForIndexing(documentId: string): Promise<string> {
    const preview = await this.cacheService.getPreview(documentId);
    if (preview) {
      return preview.textContent;
    }
    
    throw new Error(`Preview not found for document ${documentId}`);
  }
}