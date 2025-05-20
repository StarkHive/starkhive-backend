import { Test, TestingModule } from '@nestjs/testing';
import { DocumentPreviewService } from '../../src/document-preview/services/document-preview.service';
import { DocumentProcessorService } from '../../src/document-preview/services/document-processor.service';
import { ForbiddenException } from '@nestjs/common';
import { DocumentType } from '../../src/document-preview/enums/document-type.enum';

describe('DocumentPreviewService', () => {
  let service: DocumentPreviewService;
  let processorService: DocumentProcessorService;

  beforeEach(async () => {
    const mockDocumentProcessor = {
      checkAccessPermission: jest.fn(),
      processDocument: jest.fn(),
      extractTextForIndexing: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentPreviewService,
        {
          provide: DocumentProcessorService,
          useValue: mockDocumentProcessor,
        },
      ],
    }).compile();

    service = module.get<DocumentPreviewService>(DocumentPreviewService);
    processorService = module.get<DocumentProcessorService>(DocumentProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePreview', () => {
    it('should generate a preview when user has access', async () => {
      const mockResult = {
        id: 'test-doc-id',
        documentType: DocumentType.PDF,
        previewUrl: '/previews/test.png',
        thumbnailUrl: '/thumbnails/test.png',
        textContent: 'Sample text content for testing purposes',
        pageCount: 5,
        metadata: { author: 'Test Author' },
        createdAt: new Date(),
      };

      jest.spyOn(processorService, 'checkAccessPermission').mockResolvedValue(true);
      jest.spyOn(processorService, 'processDocument').mockResolvedValue(mockResult);

      const result = await service.generatePreview(
        '/path/to/document.pdf',
        'user123',
        'test-doc-id',
      );

      expect(processorService.checkAccessPermission).toHaveBeenCalledWith('user123', 'test-doc-id');
      expect(processorService.processDocument).toHaveBeenCalledWith(
        '/path/to/document.pdf',
        'user123',
        'test-doc-id',
      );
      
      expect(result).toEqual({
        id: 'test-doc-id',
        documentType: DocumentType.PDF,
        previewUrl: '/previews/test.png',
        thumbnailUrl: '/thumbnails/test.png',
        textPreview: 'Sample text content for testing purposes',
        pageCount: 5,
        metadata: { author: 'Test Author' },
        createdAt: expect.any(Date),
      });
    });

    it('should throw ForbiddenException when user has no access', async () => {
      jest.spyOn(processorService, 'checkAccessPermission').mockResolvedValue(false);

      await expect(
        service.generatePreview('/path/to/document.pdf', 'user123', 'test-doc-id'),
      ).rejects.toThrow(ForbiddenException);
      
      expect(processorService.processDocument).not.toHaveBeenCalled();
    });

    it('should propagate errors from document processor', async () => {
      jest.spyOn(processorService, 'checkAccessPermission').mockResolvedValue(true);
      jest.spyOn(processorService, 'processDocument').mockRejectedValue(
        new Error('Processing failed'),
      );

      await expect(
        service.generatePreview('/path/to/document.pdf', 'user123', 'test-doc-id'),
      ).rejects.toThrow('Preview generation failed: Processing failed');
    });
  });

  describe('extractTextForIndexing', () => {
    it('should extract text when user has access', async () => {
      jest.spyOn(processorService, 'checkAccessPermission').mockResolvedValue(true);
      jest.spyOn(processorService, 'extractTextForIndexing').mockResolvedValue(
        'Extracted text content',
      );

      const result = await service.extractTextForIndexing('test-doc-id', 'user123');

      expect(processorService.checkAccessPermission).toHaveBeenCalledWith('user123', 'test-doc-id');
      expect(processorService.extractTextForIndexing).toHaveBeenCalledWith('test-doc-id');
      expect(result).toBe('Extracted text content');
    });

    it('should throw ForbiddenException when user has no access', async () => {
      jest.spyOn(processorService, 'checkAccessPermission').mockResolvedValue(false);

      await expect(
        service.extractTextForIndexing('test-doc-id', 'user123'),
      ).rejects.toThrow(ForbiddenException);
      
      expect(processorService.extractTextForIndexing).not.toHaveBeenCalled();
    });
  });
});