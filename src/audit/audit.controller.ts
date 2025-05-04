import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { QueryRoleAuditDto } from './dto/role-audit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@src/auth/enums/role.enum';

@ApiBearerAuth() 
@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('roles')
  @Roles(Role.ADMIN, Role.SECURITY_AUDITOR) 
  @ApiOperation({ 
    summary: 'Query role audit   logs',
    description: 'Returns filtered role audit logs based on query parameters' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully returned filtered role audit logs',
    isArray: true 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid JWT' }) 
  @ApiResponse({ status: 403, description: 'Forbidden - User lacks required role' }) 
  async queryRoleAuditLogs(@Query() query: QueryRoleAuditDto) {
    return this.auditService.queryRoleAuditLogs(query);
  }

  @Get('roles/:id')
  @Roles(Role.ADMIN, Role.SECURITY_AUDITOR) 
  @ApiOperation({ 
    summary: 'Get role audit log by ID',
    description: 'Returns a specific role audit log entry' 
  })
  @ApiParam({ name: 'id', description: 'UUID of the audit log entry' }) 
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully returned the requested audit log'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid JWT' }) 
  @ApiResponse({ status: 403, description: 'Forbidden - User lacks required role' }) 
  @ApiResponse({ status: 404, description: 'Not Found - Audit log not found' }) 
  async getAuditLogById(@Param('id') id: string) {
    return this.auditService.getAuditLogById(id);
  }

  @Get('roles/summary')
  @Roles(Role.ADMIN, Role.SECURITY_AUDITOR) 
  @ApiOperation({ 
    summary: 'Get role audit summary',
    description: 'Returns aggregated statistics of role changes' 
  })
  @ApiQuery({ 
    name: 'userId', 
    required: false, 
    description: 'Optional user ID to filter summary results' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully returned role audit summary'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid JWT' }) 
  @ApiResponse({ status: 403, description: 'Forbidden - User lacks required role' }) 
  async getAuditSummary(@Query('userId') userId?: string) {
    return this.auditService.getAuditSummary(userId);
  }
}