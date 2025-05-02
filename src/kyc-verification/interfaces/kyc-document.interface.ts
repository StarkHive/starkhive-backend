import { VerificationStatus } from "../enums/verification-status.enum";

export interface KycDocumentInterface {
    id: string;
    userId: string;
    documentType: string;
    fileName: string;
    filePath: string;
    encryptionKey?: string;
    status: VerificationStatus;
    rejectionReason?: string;
    reviewedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    reviewedAt?: Date;
  }