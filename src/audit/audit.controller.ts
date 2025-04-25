// 31. Create AuditController (src/audit/audit.controller.ts)
import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { QueryRoleAuditDto } from './dto/role-audit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@src/auth/roles.enum';
// import { Role } from '../auth/enums/role.enum';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('roles')
  @Roles(Role.ADMIN, Role.SECURITY_AUDITOR)
  @ApiOperation({ summary: 'Query role audit logs' })
  @ApiResponse({ status: 200, description: 'Returns role audit logs based on query parameters' })
  async queryRoleAuditLogs(@Query() query: QueryRoleAuditDto) {
    return this.auditService.queryRoleAuditLogs(query);
  }

  @Get('roles/:id')
  @Roles(Role.ADMIN, Role.SECURITY_AUDITOR)
  @ApiOperation({ summary: 'Get role audit log by ID' })
  @ApiResponse({ status: 200, description: 'Returns a specific role audit log' })
  async getAuditLogById(@Param('id') id: string) {
    return this.auditService.getAuditLogById(id);
  }

  @Get('roles/summary')
  @Roles(Role.ADMIN, Role.SECURITY_AUDITOR)
  @ApiOperation({ summary: 'Get role audit summary' })
  @ApiResponse({ status: 200, description: 'Returns summary of role audit logs' })
  @ApiQuery({ name: 'userId', required: false })
  async getAuditSummary(@Query('userId') userId?: string) {
    return this.auditService.getAuditSummary(userId);
  }
}