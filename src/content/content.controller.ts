import { Controller, Get, Param, Patch, Body, Query, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express'; // Import the Request type
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { AdminGuard } from '../auth/guards/admin.guard';
import { ContentService } from './content.service';
import { ContentFilterDto } from './dto/content-filter.dto';
import { ModerateContentDto } from './dto/moderate-content.dto';
import { AuditService } from '../audit/audit.service';

@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  // @UseGuards(JwtAuthGuard, AdminGuard)
  findAll(
    @Query() filter: ContentFilterDto,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.contentService.findAll(filter, +page, +limit);
  }

  @Get('stats')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  getContentStats() {
    return this.contentService.getContentStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @Patch(':id/moderate')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  async moderate(
    @Param('id') id: string,
    @Body() moderateContentDto: ModerateContentDto,
    @Req() req: Request // Specify the type for the req parameter
  ) {
    const user = req.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const result = await this.contentService.moderate(id, moderateContentDto, user.id);
    
    await this.auditService.createLog({
      action: 'content_moderated',
      resourceType: 'content',
      resourceId: id,
      userId: user.id,
      ipAddress: req.ip,
      details: { 
        status: moderateContentDto.status,
        notes: moderateContentDto.moderationNotes
      },
    });
    
    return result;
  }
}