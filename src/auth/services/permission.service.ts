/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Permission, Role } from '../enums/role.enum';

@Injectable()
export class PermissionService {
  private readonly rolePermissions: Record<Role, Permission[]> = {
    [Role.ADMIN]: [
      Permission.MANAGE_USERS,
      Permission.CREATE_PROJECT,
      Permission.EDIT_PROJECT,
      Permission.DELETE_PROJECT,
      Permission.VIEW_PROJECT,
    ],
    [Role.COMPANY]: [
      Permission.CREATE_PROJECT,
      Permission.EDIT_PROJECT,
      Permission.VIEW_PROJECT,
    ],
    [Role.FREELANCER]: [Permission.VIEW_PROJECT],
    [Role.USER]: [Permission.VIEW_PROJECT], // Adding USER role with basic permissions
    [Role.SECURITY_AUDITOR]: [Permission.VIEW_PROJECT], 
    [Role.MODERATOR]: [Permission.VIEW_PROJECT], // Add default or appropriate permissions for MODERATOR
    [Role.JUROR]: [Permission.VIEW_PROJECT],     // Add default or appropriate permissions for JUROR
  };

  getPermissionsForRole(role: Role): Permission[] {
    return this.rolePermissions[role] || [];
  }

  hasPermission(role: Role, permission: Permission): boolean {
    return this.rolePermissions[role]?.includes(permission) || false;
  }
}
