// src/external-api/external-api.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExternalApiService } from './services/external-api.service';
import { RetryInterceptor } from '../interceptors/retry.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [
    ExternalApiService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RetryInterceptor,
    },
  ],
  exports: [ExternalApiService],
})
export class ExternalApiModule {}

