import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConfigType } from '@nestjs/config';
import { FilterDocumentsDto } from './dto/filter-documents.dto';
import { VerificationStatus } from './enums/verification-status.enum';
import { FileEncryptionUtil } from './utils/file-encryption.util';
import * as path from 'path';
import { UpdateKycVerificationDto } from './dto/update-kyc-verification.dto';
import { CreateKycVerificationDto } from './dto/create-kyc-verification.dto';
import { KycDocument } from './entities/kyc-verification.entity';
import kycConfig from '@src/config/kyc.config';
import * as fs from 'fs';


@Injectable()
export class KycVerificationService {
  constructor(
    @InjectRepository(KycDocument)
    private kycDocumentRepository: Repository<KycDocument>,

    @Inject(kycConfig.KEY)
    private config: ConfigType<typeof kycConfig>,
  ) {}

  async createKycDocument(createKycDocumentDto: CreateKycVerificationDto, file: Express.Multer.File): Promise<KycDocument> {
    const userId = createKycDocumentDto.userId;
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.originalname}`;
    const destPath = path.join(this.config.uploadDir, userId, uniqueFilename);
    
    let filePath = destPath;
// inside your method
  let encryptionKey: string | undefined = undefined;
    
    // Encrypt file if encryption is enabled
    if (this.config.encryptionEnabled) {
      const result = await FileEncryptionUtil.encryptAndSave(file.buffer, destPath);
      filePath = result.filePath;
      encryptionKey = result.encryptionKey;
    } else {
      // Save unencrypted file
      const dir = path.dirname(destPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(destPath, file.buffer);
    }
    
    // Create new KYC document record
    const kycDocument = this.kycDocumentRepository.create({
      ...createKycDocumentDto,
      fileName: file.originalname,
      filePath,
      encryptionKey,
      status: VerificationStatus.PENDING,
    });
    
    return this.kycDocumentRepository.save(kycDocument);
  }

  async getKycDocumentsByUserId(userId: string): Promise<KycDocument[]> {
    return this.kycDocumentRepository.find({ 
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getKycDocumentById(id: string): Promise<KycDocument> {
    const document = await this.kycDocumentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`KYC document with ID ${id} not found`);
    }
    return document;
  }

  async getDocumentContent(id: string): Promise<Buffer> {
    const document = await this.getKycDocumentById(id);
    
    // If encrypted, decrypt and return file content
    if (document.encryptionKey) {
      return FileEncryptionUtil.decrypt(document.filePath, document.encryptionKey);
    }
    
    // Otherwise, just read and return the file
    return fs.readFileSync(document.filePath);
  }

  async updateKycDocumentStatus(id: string, updateKycDocumentDto: UpdateKycVerificationDto): Promise<KycDocument> {
    const document = await this.getKycDocumentById(id);
    
    // Ensure document is in PENDING status
    if (document.status !== VerificationStatus.PENDING) {
      throw new BadRequestException(`Document is already ${document.status}`);
    }
    
    // Update document status
    document.status = updateKycDocumentDto.status;
    document.reviewedBy = updateKycDocumentDto.reviewedBy;
    document.reviewedAt = new Date();
    
    // Add rejection reason if status is REJECTED
    if (updateKycDocumentDto.status === VerificationStatus.REJECTED) {
      if (!updateKycDocumentDto.rejectionReason) {
        throw new BadRequestException('Rejection reason is required when rejecting a document');
      }
      document.rejectionReason = updateKycDocumentDto.rejectionReason;
    }
    
    return this.kycDocumentRepository.save(document);
  }

  async getAllPendingDocuments(): Promise<KycDocument[]> {
    return this.kycDocumentRepository.find({
      where: { status: VerificationStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  async getDocumentHistory(userId: string): Promise<any[]> {
    const documents = await this.kycDocumentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    
    return documents.map(doc => ({
      id: doc.id,
      documentType: doc.documentType,
      fileName: doc.fileName,
      status: doc.status,
      createdAt: doc.createdAt,
      reviewedAt: doc.reviewedAt,
      reviewedBy: doc.reviewedBy,
      rejectionReason: doc.rejectionReason,
    }));
  }

  async filterDocuments(filterDto: FilterDocumentsDto): Promise<KycDocument[]> {
    const { status, documentType, fromDate, toDate } = filterDto;
    const query = this.kycDocumentRepository.createQueryBuilder('doc');
    
    if (status) {
      query.andWhere('doc.status = :status', { status });
    }
    
    if (documentType) {
      query.andWhere('doc.documentType = :documentType', { documentType });
    }
    
    if (fromDate && toDate) {
      query.andWhere('doc.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
      });
    } else if (fromDate) {
      query.andWhere('doc.createdAt >= :fromDate', {
        fromDate: new Date(fromDate),
      });
    } else if (toDate) {
      query.andWhere('doc.createdAt <= :toDate', {
        toDate: new Date(toDate),
      });
    }
    
    query.orderBy('doc.createdAt', 'DESC');
    
    return query.getMany();
  }

  async getStats(): Promise<any> {
    const totalDocuments = await this.kycDocumentRepository.count();
    const pendingDocuments = await this.kycDocumentRepository.count({
      where: { status: VerificationStatus.PENDING },
    });
    const approvedDocuments = await this.kycDocumentRepository.count({
      where: { status: VerificationStatus.APPROVED },
    });
    const rejectedDocuments = await this.kycDocumentRepository.count({
      where: { status: VerificationStatus.REJECTED },
    });
    
    return {
      total: totalDocuments,
      pending: pendingDocuments,
      approved: approvedDocuments,
      rejected: rejectedDocuments,
      approvalRate: totalDocuments ? (approvedDocuments / totalDocuments) * 100 : 0,
      rejectionRate: totalDocuments ? (rejectedDocuments / totalDocuments) * 100 : 0,
    };
  }
}