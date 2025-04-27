import { Controller, Get, Param, Patch, Body, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ReportingService } from './reporting.service';
import { ReviewReportDto } from './dto/review-report.dto';
import { ReportType } from './enums/report-type.enum';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { ReportStatus } from './enums/report-status.enum';

@Controller('reporting')
// @UseGuards(JwtAuthGuard, AdminGuard)
export class ReportingController {
  private readonly CACHE_TTL = 300; // 5 minutes TTL
  private readonly CACHE_KEY_PREFIX = 'reports';

  constructor(
    private readonly reportingService: ReportingService,
    private readonly auditService: AuditService,
    private readonly cacheManager: CacheService
  ) {}

  @Get()
  async findAll(
    @Query('status') status?: ReportStatus,
    @Query('type') type?: ReportType,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reportingService.findAll(status, type, +page, +limit);
  }

  @Get('stats')
  async getReportStats() {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:stats`;
    const cachedReportStats = await this.cacheManager.get(cacheKey, 'ReportStats');
    if (cachedReportStats) {
      return cachedReportStats;
    }
    const reportStats = await this.reportingService.getReportStats();
    await this.cacheManager.set(cacheKey, reportStats, this.CACHE_TTL);
    return reportStats;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reportingService.findOne(id);
  }

  @Patch(':id/review')
  async reviewReport(
    @Param('id') id: string,
    @Body() reviewReportDto: ReviewReportDto,
    @Req() req: Request
  ) {
    // Check if req.user and req.user.id are defined
    if (!req.user || !req.user.id) {
      throw new Error('User not authenticated'); // or handle it appropriately
    }

    const cacheKey = `${this.CACHE_KEY_PREFIX}:${id}`;
    await this.cacheManager.del(cacheKey);
    const result = await this.reportingService.reviewReport(id, reviewReportDto, req.user.id);
    
    await this.auditService.createAuditLog({
      action: 'report_reviewed',
      resourceType: 'report',
      resourceId: id,
      userId: req.user.id,
      ipAddress: req.ip,
      details: {
        status: reviewReportDto.status,
        reviewNotes: reviewReportDto.reviewNotes
      }
    });
    
    return result;
  }
}