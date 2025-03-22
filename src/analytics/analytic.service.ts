import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOperator } from 'typeorm';
import { SystemMetric } from './entities/system-metric.entity';
import { CreateMetricDto } from './dto/create-metric.dto';
import { MetricType } from './enums/metric-types.enum';

interface WhereClause {
  createdAt?: Date | FindOperator<Date>; // Allow FindOperator<Date>
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(SystemMetric)
    private metricRepository: Repository<SystemMetric>,
  ) {}

  async recordMetric(createMetricDto: CreateMetricDto): Promise<SystemMetric> {
    const metric = this.metricRepository.create(createMetricDto);
    return this.metricRepository.save(metric);
  }

  async getMetricsByType(type: MetricType, startDate?: Date, endDate?: Date) {
    const query: any = { type };
    
    if (startDate && endDate) {
      query.createdAt = Between(startDate, endDate); // This is correct
    }
    
    const metrics = await this.metricRepository.find({
      where: query,
      order: { createdAt: 'ASC' },
    });
    
    return metrics;
  }

  async getMetricsSummary(startDate?: Date, endDate?: Date) {
    const whereClause: WhereClause = {}; // Use the defined type
    
    if (startDate && endDate) {
      whereClause.createdAt = Between(startDate, endDate); // This should now work
    }
    
    const summaryData = await this.metricRepository
      .createQueryBuilder('metric')
      .select('metric.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(metric.value)', 'average')
      .addSelect('MAX(metric.value)', 'maximum')
      .addSelect('MIN(metric.value)', 'minimum')
      .where(whereClause)
      .groupBy('metric.type')
      .getRawMany();
    
    return summaryData;
  }

  async getDailyMetrics(type: MetricType, days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const dailyData = await this.metricRepository
      .createQueryBuilder('metric')
      .select('DATE(metric.createdAt)', 'date')
      .addSelect('SUM(metric.value)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('metric.type = :type', { type })
      .andWhere('metric.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('DATE(metric.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();
    
    return dailyData;
  }
}