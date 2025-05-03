import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../tenant.service';
import { ConfigService } from '@nestjs/config';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenant?: any;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantService: TenantService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Priority order for tenant identification:
      // 1. X-Tenant-ID header
      // 2. Subdomain
      // 3. Custom tenant path parameter (if configured)
      
      let tenant;
      
      // 1. Check for tenant ID in header
      const tenantId = req.headers['x-tenant-id'] as string;
      if (tenantId) {
        tenant = await this.tenantService.findByIdentifier(tenantId);
      }
      
      // 2. If no tenant found by header, try to extract from subdomain
      if (!tenant) {
        const host = req.headers.host;
        if (host) {
          const subdomain = this.extractSubdomain(host);
          if (subdomain) {
            try {
              tenant = await this.tenantService.findBySubdomain(subdomain);
            } catch (error) {
              // Subdomain not found, continue to next method
            }
          }
        }
      }
      
      // 3. If still no tenant, check for tenant in the path (if enabled)
      if (!tenant && this.configService.get<boolean>('TENANT_PATH_ENABLED')) {
        const pathSegments = req.path.split('/');
        if (pathSegments.length > 1) {
          const potentialTenantId = pathSegments[1]; // Assuming format: /:tenantId/...
          try {
            tenant = await this.tenantService.findByIdentifier(potentialTenantId);
            
            // If found, remove tenant ID from path for further routing
            req.url = req.url.replace(`/${potentialTenantId}`, '');
          } catch (error) {
            // Path segment is not a tenant ID, continue
          }
        }
      }
      
      // If tenant is found, attach it to the request
      if (tenant) {
        req.tenantId = tenant.id;
        req.tenant = tenant;
      } else {
        // If we're configured to require a tenant for all requests, throw an error
        if (this.configService.get<boolean>('TENANT_REQUIRED', false)) {
          throw new NotFoundException('Tenant not found');
        }
        // Otherwise, continue without a tenant (will use public schema)
      }
      
      next();
    } catch (error) {
      next(error);
    }
  }
  
  private extractSubdomain(host: string): string | null {
    const appDomain = this.configService.get<string>('APP_DOMAIN');
    if (!appDomain) return null;
    
    // Remove port if present
    const hostWithoutPort = host.split(':')[0];
    
    // Check if host ends with app domain
    if (!hostWithoutPort.endsWith(appDomain)) return null;
    
    // Extract subdomain
    const subdomain = hostWithoutPort.slice(0, -appDomain.length - 1); // -1 for the dot
    return subdomain || null;
  }
}