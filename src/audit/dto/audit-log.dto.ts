// src/audit/dto/create-audit-log.dto.ts
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuditLogDto {
  @IsNotEmpty()
  action: string;

  @IsOptional()
  resourceType?: string;

  @IsOptional()
  resourceId?: string;

  @IsNotEmpty()
  userId: string;

  @IsOptional()
  ipAddress?: string;

  @IsOptional()
  details?: any;
}
