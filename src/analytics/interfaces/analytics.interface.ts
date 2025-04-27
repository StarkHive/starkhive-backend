export interface AnalyticsInterface {
    recordMetric(metric: any): Promise<any>;
    getMetricsByType(type: string, startDate?: Date, endDate?: Date): Promise<any>;
    getMetricsSummary(startDate?: Date, endDate?: Date): Promise<any>;
    getDailyMetrics(type: string, days?: number): Promise<any>;
  }
  