// src/reports/reports.controller.ts
import { Controller, Post, Body, Patch, Param, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
// import { Report } from './entities/report.entity';
import { Report } from './report.entity';
import { Appeal } from './appeal.entity';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async createReport(
    @Body('reporterId') reporterId: number,
    @Body('reportedUserId') reportedUserId: number | null,
    @Body('contentId') contentId: number | null,
    @Body('category') category: string,
    @Body('reason') reason: string,
  ): Promise<Report> {
    return this.reportsService.createReport(reporterId, reportedUserId, contentId, category, reason);
  }

  @Post(':id/action')
  async takeAction(@Param('id') id: number, @Body('action') action: string): Promise<void> {
  return this.reportsService.takeAction(id, action);
}

// src/reports/reports.controller.ts
@Post(':id/appeal')
async createAppeal(
  @Param('id') reportId: number,
  @Body('appellantId') appellantId: number,
  @Body('reason') reason: string,
): Promise<Appeal> {
  return this.reportsService.createAppeal(reportId, appellantId, reason);
}

  @Patch(':id/status')
  async updateReportStatus(
    @Param('id') id: number,
    @Body('status') status: string,
    @Body('moderatorNotes') moderatorNotes?: string,
  ): Promise<Report> {
    return this.reportsService.updateReportStatus(id, status, moderatorNotes);
  }

  @Get()
  async getReportsByStatus(@Query('status') status: string): Promise<Report[]> {
    return this.reportsService.getReportsByStatus(status);
  }
}