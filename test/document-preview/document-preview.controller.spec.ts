import { Test, TestingModule } from '@nestjs/testing';
import { DocumentPreviewController } from '../../src/document-preview/document-preview.controller';
import { DocumentPreviewService } from '../../src/document-preview/services/document-preview.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DocumentType } from '../../src/document-preview/enums/document-type.enum';
import * as path from 'path';

jest.mock('fs/promises', () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
}));

describe('DocumentPreviewController', () => {
  let controller: DocumentPreviewController;
  let service: DocumentPreviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentPreviewController],
      providers: [
        {
          provide: DocumentPreviewService,
          useValue: {
            generatePreview: jest.fn(),
            extractTextForIndexing: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DocumentPreviewController>(DocumentPreviewController);
    service = module.get<DocumentPreviewService>(DocumentPreviewService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadAndPreview', () => {
    it('should process uploaded file and return preview', async () => {
      const mockFile = {
        path: '/tmp/uploads/abc123',
        filename: 'test-doc.pdf',
      };

      const mockPreview = {
        id: 'abc123',
        documentType: DocumentType.PDF,
        previewUrl: '/previews/abc123.png',
        thumbnailUrl: '/thumbnails/abc123.png',
        textPreview: 'Test content',
        pageCount: 5,
        metadata: { author: 'Test Author' },
        createdAt: new Date(),
      };

      jest.spyOn(service, 'generatePreview').mockResolvedValue(mockPreview);

      const result = await controller.uploadAndPreview(mockFile, { user: { id: 'user123' } });

      expect(service.generatePreview).toHaveBeenCalledWith(
        mockFile.path,
        'user123',
        path.basename(mockFile.path),
      );
      expect(result).toBe(mockPreview);
    });

    it('should throw error when no file is uploaded', async () => {
      await expect(
        controller.uploadAndPreview(null, { user: { id: 'user123' } }),
      ).rejects.toThrow('No file uploaded');
    });

    it('should handle anonymous users', async () => {
      const mockFile = {
        path: '/tmp/uploads/abc123',
        filename: 'test-doc.pdf',
      };

      const mockPreview = {
        id: 'abc123',
        documentType: DocumentType.PDF,
        previewUrl: '/previews/abc123.png',
        thumbnailUrl: '/thumbnails/abc123.png',
        textPreview: 'Test content',
        pageCount: 5,
        metadata: { author: 'Test Author' },
        createdAt: new Date(),
      };

      jest.spyOn(service, 'generatePreview').mockResolvedValue(mockPreview);

      const result = await controller.uploadAndPreview(mockFile, {});

      expect(service.generatePreview).toHaveBeenCalledWith(
        mockFile.path,
        'anonymous',
        path.basename(mockFile.path),
      );
      expect(result).toBe(mockPreview);
    });
  });

  describe('getPreview', () => {
    it('should get preview for existing document', async () => {
      const documentId = 'abc123';
      const mockPreview = {
        id: documentId,
        documentType: DocumentType.PDF,
        previewUrl: '/previews/abc123.png',
        thumbnailUrl: '/thumbnails/abc123.png',
        textPreview: 'Test content',
        pageCount: 5,
        metadata: { author: 'Test Author' },
        createdAt: new Date(),
      };

      jest.spyOn(service, 'generatePreview').mockResolvedValue(mockPreview);

      const result = await controller.getPreview(documentId, { user: { id: 'user123' } });

      expect(service.generatePreview).toHaveBeenCalledWith(
        path.join('./uploads', documentId),
        'user123',
        documentId,
      );
      expect(result).toBe(mockPreview);
    });

    it('should throw NotFoundException when document is not found', async () => {
      jest.spyOn(service, 'generatePreview').mockRejectedValue(new Error('File not found'));

      await expect(
        controller.getPreview('non-existent', { user: { id: 'user123' } }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should propagate ForbiddenException', async () => {
      jest.spyOn(service, 'generatePreview').mockRejectedValue(
        new ForbiddenException('No access'),
      );

      await expect(
        controller.getPreview('restricted-doc', { user: { id: 'user123' } }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getDocumentText', () => {
    it('should extract text from document', async () => {
      jest.spyOn(service, 'extractTextForIndexing').mockResolvedValue('Extracted text content');

      const result = await controller.getDocumentText('abc123', { user: { id: 'user123' } });

      expect(service.extractTextForIndexing).toHaveBeenCalledWith('abc123', 'user123');
      expect(result).toEqual({ text: 'Extracted text content' });
    });

    it('should throw NotFoundException when document text is not found', async () => {
      jest.spyOn(service, 'extractTextForIndexing').mockRejectedValue(
        new Error('Text not found'),
      );

      await expect(
        controller.getDocumentText('non-existent', { user: { id: 'user123' } }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should propagate ForbiddenException', async () => {
      jest.spyOn(service, 'extractTextForIndexing').mockRejectedValue(
        new ForbiddenException('No access'),
      );

      await expect(
        controller.getDocumentText('restricted-doc', { user: { id: 'user123' } }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});