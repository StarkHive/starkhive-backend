
// 42. Create ReportingService (src/reporting/reporting.service.ts)
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { ReviewReportDto } from './dto/review-report.dto';

import { ReportType } from './enums/report-type.enum';
import { ReportStatus } from './enums/report-status.enums';

@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  async findAll(status?: ReportStatus, type?: ReportType, page = 1, limit = 10) {
    const queryBuilder = this.reportRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter');
    
    if (status) {
      queryBuilder.andWhere('report.status = :status', { status });
    }
    
    if (type) {
      queryBuilder.andWhere('report.type = :type', { type });
    }
    
    queryBuilder
      .orderBy('report.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    
    const [items, total] = await queryBuilder.getManyAndCount();
    
    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const report = await this.reportRepository.findOne({ 
      where: { id },
      relations: ['reporter']
    });
    
    if (!report) {
      throw new NotFoundException(`Report with ID "${id}" not found`);
    }
    
    return report;
  }

  async reviewReport(id: string, reviewReportDto: ReviewReportDto, reviewerId: string) {
    const report = await this.findOne(id);
    
    await this.reportRepository.update(id, {
      status: reviewReportDto.status,
      reviewerId: reviewerId,
      reviewedAt: new Date(),
      reviewNotes: reviewReportDto.reviewNotes,
    });
    
    return this.findOne(id);
  }

  async getReportStats() {
    const byStatus = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('report.status')
      .getRawMany();
    
    const byType = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('report.type')
      .getRawMany();
    
    return {
      byStatus,
      byType,
    };
  }
}