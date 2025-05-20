import { Controller, Get, Param, Post, UploadedFile, UseInterceptors, UseGuards, Req, ForbiddenException, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentPreviewService } from './services/document-preview.service';
import { DocumentPreviewDto } from './dto/document-preview.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Controller('document-preview')
export class DocumentPreviewController {
  constructor(private readonly documentPreviewService: DocumentPreviewService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    dest: './uploads',
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  }))
  async uploadAndPreview(
    @UploadedFile() file,
    @Req() req,
  ): Promise<DocumentPreviewDto> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    try {
      // In a real application, you would get the user ID from authentication
      const userId = req.user?.id || 'anonymous';
      const documentId = path.basename(file.path);
      
      return await this.documentPreviewService.generatePreview(
        file.path,
        userId,
        documentId,
      );
    } catch (error) {
      // Clean up the uploaded file if processing fails
      try {
        await fs.unlink(file.path);
      } catch {}
      
      throw error;
    }
  }

  @Get(':id')
  async getPreview(
    @Param('id') documentId: string,
    @Req() req,
  ): Promise<DocumentPreviewDto> {
    try {
      // In a real application, you would get the user ID from authentication
      const userId = req.user?.id || 'anonymous';
      
      // For demonstration purposes, we're assuming the file is already uploaded
      // In a real application, you would retrieve the file path from a database
      const filePath = path.join('./uploads', documentId);
      
      return await this.documentPreviewService.generatePreview(
        filePath,
        userId,
        documentId,
      );
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new NotFoundException(`Document preview not found: ${documentId}`);
    }
  }

  @Get(':id/text')
  async getDocumentText(
    @Param('id') documentId: string,
    @Req() req,
  ): Promise<{ text: string }> {
    try {
      // In a real application, you would get the user ID from authentication
      const userId = req.user?.id || 'anonymous';
      
      const text = await this.documentPreviewService.extractTextForIndexing(documentId, userId);
      return { text };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new NotFoundException(`Document text not found: ${documentId}`);
    }
  }
}