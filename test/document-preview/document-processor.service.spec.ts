import { Test, TestingModule } from '@nestjs/testing';
import { DocumentProcessorService } from '../../src/document-preview/services/document-processor.service';
import { PdfProcessorService } from '../../src/document-preview/services/pdf-processor.service';
import { OfficeProcessorService } from '../../src/document-preview/services/office-processor.service';
import { DocumentCacheService } from '../../src/document-preview/services/document-cache.service';
import { DocumentSecurityService } from '../../src/document-preview/services/document-security.service';
import { DocumentType } from '../../src/document-preview/enums/document-type.enum';

describe('DocumentProcessorService', () => {
  let service: DocumentProcessorService;
  let pdfProcessor: PdfProcessorService;
  let officeProcessor: OfficeProcessorService;
  let cacheService: DocumentCacheService;
  let securityService: DocumentSecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentProcessorService,
        {
          provide: PdfProcessorService,
          useValue: {
            generatePreview: jest.fn(),
          },
        },
        {
          provide: OfficeProcessorService,
          useValue: {
            generatePreview: jest.fn(),
          },
        },
        {
          provide: DocumentCacheService,
          useValue: {
            getPreview: jest.fn(),
            storePreview: jest.fn(),
          },
        },
        {
          provide: DocumentSecurityService,
          useValue: {
            scanDocument: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentProcessorService>(DocumentProcessorService);
    pdfProcessor = module.get<PdfProcessorService>(PdfProcessorService);
    officeProcessor = module.get<OfficeProcessorService>(OfficeProcessorService);
    cacheService = module.get<DocumentCacheService>(DocumentCacheService);
    securityService = module.get<DocumentSecurityService>(DocumentSecurityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processDocument', () => {
    it('should return cached preview if available', async () => {
      const mockPreview = {
        id: 'test-doc-id',
        documentType: DocumentType.PDF,
        textContent: 'Test content',
        metadata: {},
        createdAt: new Date(),
      };

      jest.spyOn(cacheService, 'getPreview').mockResolvedValue(mockPreview);

      const result = await service.processDocument(
        '/path/to/document.pdf',
        'user123',
        'test-doc-id',
      );

      expect(cacheService.getPreview).toHaveBeenCalledWith('test-doc-id');
      expect(securityService.scanDocument).not.toHaveBeenCalled();
      expect(result).toBe(mockPreview);
    });

    it('should process PDF document correctly', async () => {
      const mockPreview = {
        id: 'test-doc-id',
        documentType: DocumentType.PDF,
        textContent: 'Test content',
        metadata: {},
        createdAt: new Date(),
      };

      jest.spyOn(cacheService, 'getPreview').mockResolvedValue(null);
      jest.spyOn(pdfProcessor, 'generatePreview').mockResolvedValue(mockPreview);
      jest.spyOn(securityService, 'scanDocument').mockResolvedValue(undefined);

      const result = await service.processDocument(
        '/path/to/document.pdf',
        'user123',
        'test-doc-id',
      );

      expect(securityService.scanDocument).toHaveBeenCalledWith('/path/to/document.pdf');
      expect(pdfProcessor.generatePreview).toHaveBeenCalledWith('/path/to/document.pdf');
      expect(cacheService.storePreview).toHaveBeenCalledWith('test-doc-id', mockPreview);
      expect(result).toBe(mockPreview);
    });

    it('should process Word document correctly', async () => {
      const mockPreview = {
        id: 'test-doc-id',
        documentType: DocumentType.WORD,
        textContent: 'Test content',
        metadata: {},
        createdAt: new Date(),
      };

      jest.spyOn(cacheService, 'getPreview').mockResolvedValue(null);
      jest.spyOn(officeProcessor, 'generatePreview').mockResolvedValue(mockPreview);
      jest.spyOn(securityService, 'scanDocument').mockResolvedValue(undefined);

      const result = await service.processDocument(
        '/path/to/document.docx',
        'user123',
        'test-doc-id',
      );

      expect(securityService.scanDocument).toHaveBeenCalledWith('/path/to/document.docx');
      expect(officeProcessor.generatePreview).toHaveBeenCalledWith(
        '/path/to/document.docx',
        DocumentType.WORD,
      );
      expect(cacheService.storePreview).toHaveBeenCalledWith('test-doc-id', mockPreview);
      expect(result).toBe(mockPreview);
    });

    it('should throw error for unsupported file types', async () => {
      jest.spyOn(cacheService, 'getPreview').mockResolvedValue(null);
      jest.spyOn(securityService, 'scanDocument').mockResolvedValue(undefined);

      await expect(
        service.processDocument('/path/to/document.txt', 'user123', 'test-doc-id'),
      ).rejects.toThrow('Unsupported file extension: txt');
    });
  });

  describe('checkAccessPermission', () => {
    it('should return true for valid access (mock implementation)', async () => {
      const result = await service.checkAccessPermission('user123', 'test-doc-id');
      expect(result).toBe(true);
    });
  });

  describe('extractTextForIndexing', () => {
    it('should extract text from cached preview', async () => {
      const mockPreview = {
        id: 'test-doc-id',
        documentType: DocumentType.PDF,
        textContent: 'Test content for indexing',
        metadata: {},
        createdAt: new Date(),
      };

      jest.spyOn(cacheService, 'getPreview').mockResolvedValue(mockPreview);

      const result = await service.extractTextForIndexing('test-doc-id');

      expect(cacheService.getPreview).toHaveBeenCalledWith('test-doc-id');
      expect(result).toBe('Test content for indexing');
    });

    it('should throw error when preview is not found', async () => {
      jest.spyOn(cacheService, 'getPreview').mockResolvedValue(null);

      await expect(
        service.extractTextForIndexing('test-doc-id'),
      ).rejects.toThrow('Preview not found for document test-doc-id');
    });
  });
});