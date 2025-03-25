
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Appeal } from './appeal.entity';

@Injectable()
export class ReportsRepository extends Repository<Report> {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {
    super(reportsRepository.target, reportsRepository.manager, reportsRepository.queryRunner);
  }

  async createReport(reportData: Partial<Report>): Promise<Report> {
    const report = this.create(reportData);
    return this.save(report);
  }

  async findByStatus(status: string): Promise<Report[]> {
    return this.find({ where: { status }, relations: ['reporter', 'reportedUser'] });
  }
}