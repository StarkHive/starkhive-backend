import { Controller, Get, Param, Patch, Body, Query, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express'; // Import the Request type
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { AdminGuard } from '../auth/guards/admin.guard';
import { ContentService } from './content.service';
import { ContentFilterDto } from './dto/content-filter.dto';
import { ModerateContentDto } from './dto/moderate-content.dto';
import { AuditService } from '../audit/audit.service';
import { CacheService } from "@src/cache/cache.service";

@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly auditService: AuditService,
    private cacheManager: CacheService
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
  async getContentStats() {
    const cachedContentStats = await this.cacheManager.get(`content:stats`, 'ContentService');
    if (cachedContentStats) {
      return cachedContentStats;
    }
    const contentStats = await this.contentService.getContentStats();
    await this.cacheManager.set(`content:stats`, contentStats);
    return contentStats;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const cachedContent = await this.cacheManager.get(`content:${id}`, 'ContentService');
    if (cachedContent) {
      return cachedContent;
    }
    const content = await this.contentService.findOne(id);
    await this.cacheManager.set(`content:${id}`, content);
    return content;
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
    await this.cacheManager.del(`content:${id}`);
    const result = await this.contentService.moderate(id, moderateContentDto, user.id);
    
    await this.auditService.createAuditLog({
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