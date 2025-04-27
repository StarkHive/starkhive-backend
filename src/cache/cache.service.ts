import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Cache } from 'cache-manager';
import { CacheMetricsEntity } from "./entities/cache-metrics.entity";
import { Repository } from "typeorm";

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(CacheMetricsEntity)
    private cacheMetricsRepository: Repository<CacheMetricsEntity>
  ) {}

  async get(key: string, service: string): Promise<any> {
    const value = await this.cacheManager.get(key);
    await this.recordMetric(value ? 'hit' : 'miss', key, service);
    return value;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async clear(): Promise<void> {
    await this.cacheManager.clear();
  }

  private async recordMetric(type: 'hit' | 'miss', key: string, service: string): Promise<void> {
    const metric = this.cacheMetricsRepository.create({
      cacheKey: key,
      type,
      service
    })

    await this.cacheMetricsRepository.save(metric);
  }
}
