import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionService } from '../services/permission.service';
import { Permission } from '../enums/permission.enum';


@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = (
      this.reflector.get<Permission[]>(PERMISSIONS_KEY, context.getHandler()) || []
    );

    if (!requiredPermissions.length) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('No user found in request');
      throw new ForbiddenException('User not found');
    }

    const userPermissions = this.permissionService.getPermissionsForRole(user.role);

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      this.logger.warn(
        `User ${user.id} with role ${user.role} lacks required permissions: ${requiredPermissions}`,
      );
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
