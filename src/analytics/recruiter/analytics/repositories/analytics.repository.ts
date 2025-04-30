import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytics } from  '@src/analytics/recruiter/analytics/entities/analytics.entity'

@Injectable()
export class AnalyticsRepository {
  constructor(
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
  ) {}

  async getTimeToHire(
    jobId?: string,
    startDate?: Date,
    endDate?: Date,
    location?: string,
  ) {
    // Build query conditions based on filters
    const queryBuilder = this.analyticsRepository
      .createQueryBuilder('analytics')
      .leftJoin('analytics.job', 'job')
      .where('analytics.metricType = :metricType', { metricType: 'hire' });

    if (jobId) {
      queryBuilder.andWhere('analytics.jobId = :jobId', { jobId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('analytics.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('analytics.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('analytics.createdAt <= :endDate', { endDate });
    }

    if (location) {
      queryBuilder.andWhere('analytics.location = :location', { location });
    }

    // Get time-to-hire data with job posting date and hire date
    queryBuilder.select([
      'analytics.id',
      'analytics.additionalData',
      'job.postDate',
      'analytics.createdAt as hireDate',
    ]);

    const results = await queryBuilder.getRawMany();

    // Transform results to include necessary data
    return results.map(result => ({
      jobId: result.analytics_jobId,
      postDate: result.job_postDate,
      hireDate: result.hireDate,
      additionalData: result.analytics_additionalData,
    }));
  }

  async getCandidateViews(
    jobId?: string,
    startDate?: Date,
    endDate?: Date,
    location?: string,
  ) {
    // Build query conditions based on filters
    const queryBuilder = this.analyticsRepository
      .createQueryBuilder('analytics')
      .leftJoinAndSelect('analytics.job', 'job')
      .where('analytics.metricType = :metricType', { metricType: 'view' });

    if (jobId) {
      queryBuilder.andWhere('analytics.jobId = :jobId', { jobId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('analytics.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('analytics.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('analytics.createdAt <= :endDate', { endDate });
    }

    if (location) {
      queryBuilder.andWhere('analytics.location = :location', { location });
    }

    // Group by job and count views
    queryBuilder
      .select([
        'job.title as jobTitle',
        'SUM(analytics.count) as viewCount',
      ])
      .groupBy('job.title');

    return queryBuilder.getRawMany();
  }

  async getHiringFunnel(
    jobId?: string,
    startDate?: Date,
    endDate?: Date,
    location?: string,
  ) {
    // Define stages in the hiring funnel
    const stages = ['viewed', 'applied', 'screened', 'interviewed', 'offered', 'hired'];
    const result: Record<string, number> = {};

    // For each stage, get the count of candidates
    for (const stage of stages) {
      const queryBuilder = this.analyticsRepository
        .createQueryBuilder('analytics')
        .where('analytics.metricType = :metricType', { metricType: stage });

      if (jobId) {
        queryBuilder.andWhere('analytics.jobId = :jobId', { jobId });
      }

      if (startDate && endDate) {
        queryBuilder.andWhere('analytics.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      } else if (startDate) {
        queryBuilder.andWhere('analytics.createdAt >= :startDate', { startDate });
      } else if (endDate) {
        queryBuilder.andWhere('analytics.createdAt <= :endDate', { endDate });
      }

      if (location) {
        queryBuilder.andWhere('analytics.location = :location', { location });
      }

      // Count candidates at this stage
      const count = await queryBuilder.getCount();
      result[stage] = count;
    }

    return result;
  }

  // Method to save analytics data
  async saveAnalytics(analyticsData: Partial<Analytics>): Promise<Analytics> {
    const analytics = this.analyticsRepository.create(analyticsData);
    return this.analyticsRepository.save(analytics);
  }

  // Method to update analytics data
  async updateAnalytics(id: string, analyticsData: Partial<Analytics>): Promise<Analytics> {
    await this.analyticsRepository.update(id, analyticsData);
    const analytics = await this.analyticsRepository.findOne({ where: { id } });
    if (!analytics) {
      throw new Error(`Analytics with id ${id} not found`);
    }
    return analytics;
  }

  // Method to delete analytics data
  async deleteAnalytics(id: string): Promise<void> {
    await this.analyticsRepository.delete(id);
  }
}