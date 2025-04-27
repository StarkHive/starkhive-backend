// src/app-cache.module.ts
import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheMetricsEntity } from "./entities/cache-metrics.entity";

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([CacheMetricsEntity]),
    NestCacheModule.register({
      isGlobal: true,
      ttl: 60 * 60 * 1000, // milliseconds
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
