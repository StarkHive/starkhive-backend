import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionService } from '../services/permission.service';
import { Permission } from '../roles.enum';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = (
      this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler()) || []
    ).map((permission) => permission as Permission); // ✅ Ensures type safety

    if (!requiredPermissions.length) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('User not found');

    const userPermissions = this.permissionService.getPermissionsForRole(
      user.role,
    );
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission)
      throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}
