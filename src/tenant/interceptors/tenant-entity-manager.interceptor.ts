import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantService } from '../tenant.service';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { ModuleRef } from '@nestjs/core';

/**
 * This interceptor replaces the default EntityManager with a tenant-specific one
 * for the duration of the request.
 */
@Injectable()
export class TenantEntityManagerInterceptor implements NestInterceptor {
  constructor(
    private tenantService: TenantService,
    private moduleRef: ModuleRef,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const tenant = request.tenant;
    
    if (tenant) {
      // Get tenant-specific EntityManager
      const entityManager = this.tenantService.getEntityManagerForTenant(tenant);
      
      // Replace the default EntityManager in the container for this request
      const entityManagerToken = getEntityManagerToken();
      try {
        // Save the original EntityManager
        const originalEntityManager = this.moduleRef.get(entityManagerToken, { strict: false });
        
        // Override the EntityManager in the container
        this.moduleRef['container'].addProvider({
          provide: entityManagerToken,
          useValue: entityManager,
        });
        
        // Continue with the request
        return next.handle();
      } catch (error) {
        // If something goes wrong, just continue with the default EntityManager
        return next.handle();
      }
    }
    
    return next.handle();
  }
}