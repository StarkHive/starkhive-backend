/* eslint-disable prettier/prettier */
import { SetMetadata } from '@nestjs/common';
import { PermissionGuard } from '../guards/permissions.guard';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: PermissionGuard[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
