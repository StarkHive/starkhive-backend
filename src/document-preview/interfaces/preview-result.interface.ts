import { DocumentType } from '../enums/document-type.enum';

export interface PreviewResult {
  id: string;
  documentType: DocumentType;
  previewUrl?: string;
  thumbnailUrl?: string;
  textContent: string;
  pageCount?: number;
  metadata: Record<string, any>;
  createdAt: Date;
}