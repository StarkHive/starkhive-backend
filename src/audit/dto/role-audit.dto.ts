import { IsString, IsUUID, IsObject, IsOptional, IsEnum, IsInt, Min, IsDate, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export enum RoleAuditAction {
  ROLE_CREATED = 'ROLE_CREATED',
  ROLE_UPDATED = 'ROLE_UPDATED',
  ROLE_DELETED = 'ROLE_DELETED',
  PERMISSION_ADDED = 'PERMISSION_ADDED',
  PERMISSION_REMOVED = 'PERMISSION_REMOVED',
  USER_ROLE_ASSIGNED = 'USER_ROLE_ASSIGNED',
  USER_ROLE_REVOKED = 'USER_ROLE_REVOKED'
}

export class CreateRoleAuditDto {
  @IsEnum(RoleAuditAction)
  action: RoleAuditAction;

  @IsUUID()
  roleId: string;

  @IsString()
  roleName: string;

  @IsObject()
  changes: {
    before?: any;
    after?: any;
  };

  @IsOptional()
  @IsString()
  reason?: string;
}

export class QueryRoleAuditDto {
  @IsOptional()
  @IsEnum(RoleAuditAction)
  action?: RoleAuditAction;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsOptional()
  @IsString()
  roleName?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}
