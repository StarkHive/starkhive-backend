import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService, ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';
import { KycVerificationService } from './kyc-verification.service';
import { VerificationStatus } from './enums/verification-status.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { KycDocument } from './entities/kyc-verification.entity';
import kycConfig from '@src/config/kyc.config';

// Mock the fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
}));

// Mock file
const mockFile = {
  fieldname: 'file',
  originalname: 'test-document.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  buffer: Buffer.from('test file content'),
  size: 1024,
};

describe('KycVerificationService', () => {
  let service: KycVerificationService;
  let repository: Repository<KycDocument>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockKycConfig = {
    uploadDir: 'uploads/kyc',
    maxFileSize: 5 * 1024 * 1024,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    encryptionEnabled: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KycVerificationService,
        {
          provide: getRepositoryToken(KycDocument),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: kycConfig.KEY,
          useValue: mockKycConfig,
        },
      ],
    }).compile();

    service = module.get<KycVerificationService>(KycVerificationService);
    repository = module.get<Repository<KycDocument>>(getRepositoryToken(KycDocument));
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock fs functions
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('encrypted content'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createKycDocument', () => {
    it('should create a new KYC document with encryption', async () => {
      const createDto = {
        userId: 'test-user-id',
        documentType: 'passport',
      };
      
      const mockDocument = {
        id: 'test-id',
        userId: createDto.userId,
        documentType: createDto.documentType,
        fileName: mockFile.originalname,
        filePath: expect.any(String),
        encryptionKey: expect.any(String),
        status: VerificationStatus.PENDING,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };
      
      mockRepository.create.mockReturnValue(mockDocument);
      mockRepository.save.mockResolvedValue(mockDocument);
      
      const result = await service.createKycDocument(createDto, mockFile as any);
      
      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockDocument);
    });
  });

  describe('getKycDocumentsByUserId', () => {
    it('should return documents for a specific user', async () => {
      const userId = 'test-user-id';
      const mockDocuments = [
        { id: 'doc1', userId },
        { id: 'doc2', userId },
      ];
      
      mockRepository.find.mockResolvedValue(mockDocuments);
      
      const result = await service.getKycDocumentsByUserId(userId);
      
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockDocuments);
    });
  });

  describe('getKycDocumentById', () => {
    it('should return a document when it exists', async () => {
      const docId = 'test-doc-id';
      const mockDocument = { id: docId };
      
      mockRepository.findOne.mockResolvedValue(mockDocument);
      
      const result = await service.getKycDocumentById(docId);
      
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: docId } });
      expect(result).toEqual(mockDocument);
    });
    
    it('should throw NotFoundException when document does not exist', async () => {
      const docId = 'non-existent-id';
      
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(service.getKycDocumentById(docId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateKycDocumentStatus', () => {
    it('should update document status when valid', async () => {
      const docId = 'test-doc-id';
      const updateDto = {
        status: VerificationStatus.APPROVED,
        reviewedBy: 'admin-id',
      };
      
      const mockDocument = {
        id: docId,
        status: VerificationStatus.PENDING,
      };
      
      const updatedDocument = {
        ...mockDocument,
        status: updateDto.status,
        reviewedBy: updateDto.reviewedBy,
        reviewedAt: expect.any(Date),
      };
      
      mockRepository.findOne.mockResolvedValue(mockDocument);
      mockRepository.save.mockResolvedValue(updatedDocument);
      
      const result = await service.updateKycDocumentStatus(docId, updateDto);
      
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedDocument);
    });
    
    it('should throw BadRequestException when document is not in PENDING status', async () => {
      const docId = 'test-doc-id';
      const updateDto = {
        status: VerificationStatus.APPROVED,
        reviewedBy: 'admin-id',
      };
      
      const mockDocument = {
        id: docId,
        status: VerificationStatus.APPROVED, // Already approved
      };
      
      mockRepository.findOne.mockResolvedValue(mockDocument);
      
      await expect(service.updateKycDocumentStatus(docId, updateDto)).rejects.toThrow(BadRequestException);
    });
    
    it('should throw BadRequestException when rejecting without reason', async () => {
      const docId = 'test-doc-id';
      const updateDto = {
        status: VerificationStatus.REJECTED,
        reviewedBy: 'admin-id',
        // Missing rejectionReason
      };
      
      const mockDocument = {
        id: docId,
        status: VerificationStatus.PENDING,
      };
      
      mockRepository.findOne.mockResolvedValue(mockDocument);
      
      await expect(service.updateKycDocumentStatus(docId, updateDto)).rejects.toThrow(BadRequestException);
    });
  });
});
