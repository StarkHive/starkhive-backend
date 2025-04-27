import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../audit.service';
import { RoleAuditAction } from '../dto/role-audit.dto';

@Injectable()
export class RoleAuditMiddleware implements NestMiddleware {
  constructor(private readonly auditService: AuditService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const originalJson = res.json;
    const originalStatus = res.status;
    const method = req.method;
    const path = req.path;
    let action: RoleAuditAction | undefined;

    // Determine action based on request method and path
    if (path.includes('/roles')) {
      switch (method) {
        case 'POST':
          action = RoleAuditAction.ROLE_CREATED;
          break;
        case 'PUT':
        case 'PATCH':
          action = RoleAuditAction.ROLE_UPDATED;
          break;
        case 'DELETE':
          action = RoleAuditAction.ROLE_DELETED;
          break;
      }
    }

    // Store original data for comparison
    let originalData: any;
    if (['PUT', 'PATCH', 'DELETE'].includes(method)) {
      originalData = await this.fetchOriginalData(req);
    }

    // Override response methods to capture the response
    res.json = function (data: any) {
      // Restore original methods
      res.json = originalJson;
      res.status = originalStatus;

      // Log the role-related action if applicable
      if (action) {
        const user = (req as any).user;
        const auditService = (req as any).auditService;

        auditService.createAuditLog({
          action,
          resourceType: 'role',
          resourceId: req.params.roleId || data?.id,
          details: {
            before: originalData,
            after: data,
            path,
            method,
          },
          userId: user?.id,
          ipAddress: req.ip,
        }).catch((error: Error) => {
          console.error('Failed to create audit log:', error);
        });
      }

      return originalJson.call(res, data);
    };

    // Inject auditService into request for access in the json override
    (req as any).auditService = this.auditService;

    next();
  }

  private async fetchOriginalData(req: Request): Promise<any> {
    const roleId = req.params.roleId;
    if (!roleId) return null;

    try {
      // Implement logic to fetch original role data before modification
      // This would typically involve querying your role repository
      return null;
    } catch (error) {
      console.error('Failed to fetch original role data:', error);
      return null;
    }
  }
}
