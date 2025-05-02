import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  Body, 
  UseInterceptors, 
  UploadedFile, 
  Res, 
  UseGuards, 
  Req,
  Query,
  UnauthorizedException,
  BadRequestException,
  HttpStatus,
  ParseUUIDPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { KycVerificationService } from './kyc-verification.service';
import { FilterDocumentsDto } from './dto/filter-documents.dto';
import { ConfigService } from '@nestjs/config';

import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@src/auth/enums/role.enum';
import { FileTypeGuard } from '@src/auth/guards/file-type.guard';
import { FileSizeInterceptor } from '@src/common/interceptors/file-size.interceptor';
import { KycDocument } from './entities/kyc-verification.entity';
import { UpdateKycVerificationDto } from './dto/update-kyc-verification.dto';
import { CreateKycVerificationDto } from './dto/create-kyc-verification.dto';
import { Request } from 'express';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    roles?: string[];
  };
};

@ApiTags('KYC Verification')
@Controller('kyc-verification')
export class KycVerificationController {
  constructor(
    private readonly kycVerificationService: KycVerificationService,
    private readonly configService: ConfigService,
  ) {}

  @Post('upload')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a KYC document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        userId: {
          type: 'string',
        },
        documentType: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Document uploaded successfully',
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file'),
    new FileSizeInterceptor(5 * 1024 * 1024), // 5MB limit
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() createKycDocumentDto: CreateKycVerificationDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<KycDocument> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Use the authenticated user's ID if not specified
    if (!createKycDocumentDto.userId) {
      createKycDocumentDto.userId = req.user.id;
    }
    
    // Validate file type
    const allowedMimeTypes = this.configService.get<string[]>('kyc.allowedMimeTypes') ?? [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }
    
    return this.kycVerificationService.createKycDocument(createKycDocumentDto, file);
  }

  @Get('user/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all documents for a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all documents for a user',
  })
  @UseGuards(JwtAuthGuard)
  async getUserDocuments(
    @Param('userId') userId: string, 
    @Req() req: AuthenticatedRequest
  ): Promise<KycDocument[]> {
    // Ensure user can only access their own documents unless they're admin
    if (req.user.id !== userId && !req.user.roles?.includes('admin')) {
      throw new UnauthorizedException('You can only access your own documents');
    }
    
    return this.kycVerificationService.getKycDocumentsByUserId(userId);
  }

  @Get('document/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns a document by ID',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getDocumentById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<KycDocument> {
    return this.kycVerificationService.getKycDocumentById(id);
  }

  @Get('document/:id/content')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get document content by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the document content',
  })
  @UseGuards(JwtAuthGuard)
  async getDocumentContent(
    @Param('id', ParseUUIDPipe) id: string, 
    @Res() res: Response,
    @Req() req: AuthenticatedRequest
  ): Promise<void> {
    const document = await this.kycVerificationService.getKycDocumentById(id);
    
    // Ensure user can only access their own documents unless they're admin
    if (req.user.id !== document.userId && !req.user.roles?.includes('admin')) {
      throw new UnauthorizedException('You can only access your own documents');
    }
    
    const content = await this.kycVerificationService.getDocumentContent(id);
    
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename=${document.fileName}`,
    });
    
    res.send(content);
  }

  @Post('document/:id/review')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Review a document' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document reviewed successfully',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async reviewDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateKycDocumentDto: UpdateKycVerificationDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<KycDocument> {
    // Set reviewer to the current user if not specified
    if (!updateKycDocumentDto.reviewedBy) {
      updateKycDocumentDto.reviewedBy = req.user.id;
    }
    
    return this.kycVerificationService.updateKycDocumentStatus(id, updateKycDocumentDto);
  }

  @Get('pending')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pending documents' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all pending documents',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getPendingDocuments(): Promise<KycDocument[]> {
    return this.kycVerificationService.getAllPendingDocuments();
  }

  @Get('history/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get document history for a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns document history for a user',
  })
  @UseGuards(JwtAuthGuard)
  async getDocumentHistory(
    @Param('userId') userId: string, 
    @Req() req: AuthenticatedRequest
  ): Promise<any[]> {
    // Ensure user can only access their own history unless they're admin
    if (req.user.id !== userId && !req.user.roles?.includes('admin')) {
      throw new UnauthorizedException('You can only access your own document history');
    }
    
    return this.kycVerificationService.getDocumentHistory(userId);
  }

  @Get('filter')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Filter documents' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns filtered documents',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async filterDocuments(
    @Query() filterDto: FilterDocumentsDto
  ): Promise<KycDocument[]> {
    return this.kycVerificationService.filterDocuments(filterDto);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get KYC document statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns KYC document statistics',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getStats(): Promise<any> {
    return this.kycVerificationService.getStats();
  }
}