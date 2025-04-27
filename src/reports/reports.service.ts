import { Injectable, BadRequestException } from '@nestjs/common';
import { ReportsRepository } from './reports.repository';
import { Report } from './report.entity';
import { REPORT_CATEGORIES, REPORT_REASONS } from './constants/report.constants';
import { NotificationsService } from '../notifications/notifications.service';
import { Appeal } from './appeal.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly notificationsService: NotificationsService, // Inject NotificationsService
    private readonly manager: EntityManager, // Inject EntityManager for managing appeals
  ) {}

  /** Create a report */
  async createReport(
    reporterId: number,
    reportedUserId: number | null,
    contentId: number | null,
    category: string,
    reason: string,
  ): Promise<Report> {
    // Validate category and reason
    if (!Object.values(REPORT_CATEGORIES).includes(category)) {
      throw new BadRequestException('Invalid report category');
    }
    if (!REPORT_REASONS[category].includes(reason)) {
      throw new BadRequestException('Invalid report reason');
    }

    const report = await this.reportsRepository.createReport({
      reporter: { id: reporterId } as any,
      reportedUser: reportedUserId ? { id: reportedUserId } as any : undefined,
      contentId: contentId ?? undefined,
      category,
      reason,
      status: 'pending',
    });

    // Automated screening: Prioritize fraud reports
    if (category === REPORT_CATEGORIES.FRAUD) {
      report.status = 'under_review'; // Automatically escalate fraud reports
      await this.reportsRepository.save(report);
    }

    return report;
  }

  /** Take action on a report */
  async takeAction(reportId: number, action: string): Promise<void> {
    const report = await this.reportsRepository.findOne({
      where: { id: reportId },
      relations: ['reportedUser'],
    });
    if (!report) {
      throw new BadRequestException('Report not found');
    }

    if (report.status !== 'resolved') {
      throw new BadRequestException('Report must be resolved before taking action');
    }

    switch (action) {
      case 'remove_content':
        console.log(`Removing content with ID ${report.contentId}`);
        break;
      case 'warn_user':
        console.log(`Warning user with ID ${report.reportedUser?.id}`);
        break;
      case 'suspend_user':
        console.log(`Suspending user with ID ${report.reportedUser?.id}`);
        break;
      default:
        throw new BadRequestException('Invalid action');
    }
  }

  /** Update the status of a report and notify the reporter */
  async updateReportStatus(reportId: number, status: string, moderatorNotes?: string): Promise<Report> {
    const validStatuses = ['pending', 'under_review', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const report = await this.reportsRepository.findOne({ where: { id: reportId } });
    if (!report) {
      throw new BadRequestException('Report not found');
    }

    report.status = status;
    if (moderatorNotes) {
      report.moderatorNotes = moderatorNotes;
    }

    const updatedReport = await this.reportsRepository.save(report);

    // Send notification to the reporter
    await this.notificationsService.create({
      userId: report.reporter.id,
      message: `Your report (ID: ${report.id}) has been updated to status: ${status}`,
      type: 'report_update',
    });

    return updatedReport;
  }

  /** Get reports by status */
  async getReportsByStatus(status: string): Promise<Report[]> {
    return this.reportsRepository.findByStatus(status);
  }

  /** Create an appeal for a report */
  async createAppeal(reportId: number, appellantId: number, reason: string): Promise<Appeal> {
    const report = await this.reportsRepository.findOne({ where: { id: reportId } });
    if (!report) {
      throw new BadRequestException('Report not found');
    }

    const appeal = this.manager.create(Appeal, {
      report: report as any,
      appellant: { id: appellantId.toString() } as any,
      reason,
      status: 'pending',
    });

    return this.manager.save(Appeal, appeal);
  }
}
