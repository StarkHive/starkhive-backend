/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Role, Permission } from '../roles.enum';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';

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
  };

  getPermissionsForRole(role: Role): Permission[] {
    return this.rolePermissions[role] || [];
  }

  hasPermission(role: Role, permission: Permission): boolean {
    return this.rolePermissions[role]?.includes(permission) || false;
  }

  constructor(private jwtService: JwtService) {}

  async login(user: User) {
    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
}
