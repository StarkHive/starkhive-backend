import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateFileAttachmentDto {
  @IsNotEmpty()
  @IsString()
  originalFileName: string;

  @IsNotEmpty()
  @IsString()
  mimeType: string;

  @IsNotEmpty()
  @IsNumber()
  size: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  deliverableId?: string;

  @IsNotEmpty()
  @IsString()
  uploadedById: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
} 