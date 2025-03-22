import { Controller, Get, Param, Patch, Body, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ReportingService } from './reporting.service';
import { ReviewReportDto } from './dto/review-report.dto';
import { ReportType } from './enums/report-type.enum';
import { AuditService } from '../audit/audit.service';
import { ReportStatus } from './enums/report-status.enums';

@Controller('reports')
// @UseGuards(JwtAuthGuard, AdminGuard)
export class ReportingController {
  constructor(
    private readonly reportingService: ReportingService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll(
    @Query('status') status?: ReportStatus,
    @Query('type') type?: ReportType,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reportingService.findAll(status, type, +page, +limit);
  }

  @Get('stats')
  getReportStats() {
    return this.reportingService.getReportStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
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

  const result = await this.reportingService.reviewReport(id, reviewReportDto, req.user.id);
  
  await this.auditService.createLog({
    action: 'report_reviewed',
    resourceType: 'report',
    resourceId: id,
    userId: req.user.id,
    ipAddress: req.ip,
    details: {
      status: reviewReportDto.status,
      notes: reviewReportDto.reviewNotes
    },
  });
  
  return result;
}
}