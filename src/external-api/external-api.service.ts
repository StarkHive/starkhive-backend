// src/external-api/services/external-api.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map, retryWhen, scan, delay } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);

  constructor(private readonly httpService: HttpService) {}

  async callExternalApi(endpoint: string): Promise<any> {
    try {
      const response$ = this.httpService.get(endpoint).pipe(
        retryWhen(errors =>
          errors.pipe(
            scan((retryCount, error) => {
              const maxRetries = 5;
              if (retryCount >= maxRetries || !this.shouldRetry(error)) {
                throw error;
              }
              const backoffTime = Math.pow(2, retryCount) * 1000;
              this.logger.warn(`Retrying [${retryCount + 1}] after ${backoffTime}ms...`);
              return retryCount + 1;
            }, 0),
            delay(retryCount => Math.pow(2, retryCount) * 1000)
          )
        ),
        map(res => res.data),
        catchError((error: AxiosError) => {
          this.logger.error(`Final failure calling API: ${error.message}`);
          return [this.fallbackResponse(endpoint)];
        })
      );

      return await lastValueFrom(response$);
    } catch (err) {
      this.logger.error(`Unhandled error in external call: ${err.message}`);
      return this.fallbackResponse(endpoint);
    }
  }

  private shouldRetry(error: any): boolean {
    if (!error.response) return true; // network error
    const retryStatusCodes = [429, 503, 504];
    return retryStatusCodes.includes(error.response.status);
  }

  private fallbackResponse(endpoint: string) {
    return {
      success: false,
      message: `Fallback: Could not reach external API at ${endpoint}`,
    };
  }
}
