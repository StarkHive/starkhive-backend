import { Injectable, CanActivate, ExecutionContext, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { SKIP_TENANT_GUARD_KEY } from '../decorators/skip-tenant-guard.decorator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if this route should skip tenant guard
    const skipTenantGuard = this.reflector.getAllAndOverride<boolean>(
      SKIP_TENANT_GUARD_KEY,
      [context.getHandler(), context.getClass()],
    );
    
    if (skipTenantGuard) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    
    // If tenant is required globally and no tenant is found on the request
    if (this.configService.get<boolean>('TENANT_REQUIRED', false) && !request.tenantId) {
      throw new NotFoundException('Tenant not found');
    }
    
    return true;
  }
}
