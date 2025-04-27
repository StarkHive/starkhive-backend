import { EntityRepository, Repository } from 'typeorm';
import { SystemMetric } from '../entities/system-metric.entity';

@EntityRepository(SystemMetric)
export class AnalyticsRepository extends Repository<SystemMetric> {
}
