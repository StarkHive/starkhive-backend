import { Injectable, Logger } from '@nestjs/common';
import { PreviewResult } from '../interfaces/preview-result.interface';

@Injectable()
export class DocumentCacheService {
  private readonly logger = new Logger(DocumentCacheService.name);
  private readonly cache: Map<string, PreviewResult> = new Map();

  /**
   * Store a document preview in the cache
   * @param documentId Unique identifier for the document
   * @param preview Preview result to store
   */
  async storePreview(documentId: string, preview: PreviewResult): Promise<void> {
    this.logger.log(`Storing preview for document ${documentId} in cache`);
    this.cache.set(documentId, preview);
  }

  /**
   * Retrieve a document preview from the cache
   * @param documentId Unique identifier for the document
   * @returns The cached preview or null if not found
   */
  async getPreview(documentId: string): Promise<PreviewResult | null> {
    const preview = this.cache.get(documentId);
    if (preview) {
      this.logger.log(`Cache hit for document ${documentId}`);
      return preview;
    }
    
    this.logger.log(`Cache miss for document ${documentId}`);
    return null;
  }

  /**
   * Remove a document preview from the cache
   * @param documentId Unique identifier for the document
   */
  async invalidateCache(documentId: string): Promise<void> {
    this.logger.log(`Invalidating cache for document ${documentId}`);
    this.cache.delete(documentId);
  }

  /**
   * Clear the entire cache
   */
  async clearCache(): Promise<void> {
    this.logger.log('Clearing entire preview cache');
    this.cache.clear();
  }
}