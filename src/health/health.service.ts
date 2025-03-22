
// 45. Create HealthService (src/health/health.service.ts)
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import * as os from 'os';

import { MetricType } from '@src/analytics/enums/metric-types.enum';
import { AnalyticsService } from '@src/analytics/analytic.service';


@Injectable()
export class HealthService {
  constructor(
    @InjectConnection() private connection: Connection,
    private analyticsService: AnalyticsService,
  ) {}

  async checkDatabase() {
    try {
      // Simple query to check if the database is responsive
      await this.connection.query('SELECT 1');
      return { status: 'up' };
    } catch (error) {
      // Type assertion to specify that error is of type Error
      const errorMessage = (error as Error).message || 'Unknown error';
      return {
        status: 'down',
        error: errorMessage,
      };
    }
  }

  async getSystemInfo() {
    const cpuUsage = os.loadavg()[0] / os.cpus().length;
    const memoryUsage = 1 - (os.freemem() / os.totalmem());
    const uptime = os.uptime();
    
    // Record metrics
    await this.analyticsService.recordMetric({
      type: MetricType.SYSTEM_LOAD,
      value: cpuUsage * 100, // Store as percentage
    });
    
    await this.analyticsService.recordMetric({
      type: MetricType.MEMORY_USAGE,
      value: memoryUsage * 100, // Store as percentage
    });
    
    return {
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0].model,
        usage: cpuUsage,
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        usage: memoryUsage,
      },
      os: {
        type: os.type(),
        platform: os.platform(),
        release: os.release(),
        uptime: uptime,
      },
    };
  }
}