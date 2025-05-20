import { Module } from '@nestjs/common';
import { DocumentPreviewService } from './services/document-preview.service';
import { DocumentPreviewController } from './document-preview.controller';
import { DocumentProcessorService } from './services/document-processor.service';
import { PdfProcessorService } from './services/pdf-processor.service';
import { OfficeProcessorService } from './services/office-processor.service';
import { DocumentSecurityService } from './services/document-security.service';
import { DocumentCacheService } from './services/document-cache.service';

@Module({
  providers: [
    DocumentPreviewService,
    DocumentProcessorService,
    PdfProcessorService,
    OfficeProcessorService,
    DocumentSecurityService,
    DocumentCacheService,
  ],
  controllers: [DocumentPreviewController],
  exports: [DocumentPreviewService],
})
export class DocumentPreviewModule {}