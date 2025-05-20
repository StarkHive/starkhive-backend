import { DocumentType } from '../enums/document-type.enum';

export class DocumentPreviewDto {
  id: string;
  documentType: DocumentType;
  previewUrl?: string;
  thumbnailUrl?: string;
  textPreview: string;
  pageCount?: number;
  metadata: Record<string, any>;
  createdAt: Date;
}