import { SetMetadata } from '@nestjs/common';

export const ANALYTICS_ROLES_KEY = 'analyticsRoles';
export const AnalyticsRoles = (...roles: string[]) => SetMetadata(ANALYTICS_ROLES_KEY, roles);
