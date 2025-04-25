import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entitites/audit-log.entity';
import {
  CreateRoleAuditDto,
  QueryRoleAuditDto,
  RoleAuditAction,
} from './dto/role-audit.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createLog(data: Partial<AuditLog>): Promise<AuditLog> {
    return this.createAuditLog(data);
  }

  async createAuditLog(data: Partial<AuditLog>): Promise<AuditLog> {
    try {
      if (!data.action) {
        throw new BadRequestException('Action is required for audit log');
      }

      const auditLog = this.auditLogRepository.create(data);
      const savedLog = await this.auditLogRepository.save(auditLog);

      if (
        data.resourceType === 'role' &&
        this.isCriticalRoleChange(data.action)
      ) {
        await this.handleCriticalChange(savedLog);
      }

      return savedLog;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException(
          'Failed to create audit log: ' + error.message,
        );
      }
      throw new BadRequestException('Failed to create audit log');
    }
  }

  async queryRoleAuditLogs(
    query: QueryRoleAuditDto,
  ): Promise<PaginatedResponse<AuditLog>> {
    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 20;
      const skip = (page - 1) * limit;

      const queryBuilder = this.auditLogRepository
        .createQueryBuilder('audit')
        .leftJoinAndSelect('audit.user', 'user')
        .where('audit.resourceType = :resourceType', {
          resourceType: 'role',
        });

      if (query.action) {
        queryBuilder.andWhere('audit.action = :action', {
          action: query.action,
        });
      }

      if (query.roleId) {
        queryBuilder.andWhere('audit.resourceId = :roleId', {
          roleId: query.roleId,
        });
      }

      if (query.userId) {
        queryBuilder.andWhere('audit.userId = :userId', {
          userId: query.userId,
        });
      }

      if (query.startDate && query.endDate) {
        queryBuilder.andWhere(
          'audit.createdAt BETWEEN :startDate AND :endDate',
          {
            startDate: new Date(query.startDate),
            endDate: new Date(query.endDate),
          },
        );
      }

      if (query.search) {
        queryBuilder.andWhere(
          '(audit.details::text ILIKE :search OR user.email ILIKE :search)',
          {
            search: `%${query.search}%`,
          },
        );
      }

      const [items, total] = await queryBuilder
        .orderBy('audit.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException(
          'Failed to query audit logs: ' + error.message,
        );
      }
      throw new BadRequestException('Failed to query audit logs');
    }
  }

  async getAuditLogById(id: string): Promise<AuditLog> {
    const auditLog = await this.auditLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!auditLog) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }

    return auditLog;
  }

  async getAuditSummary(userId?: string): Promise<Record<string, any>> {
    try {
      const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

      if (userId) {
        queryBuilder.where('audit.userId = :userId', { userId });
      }

      const summary = await queryBuilder
        .select([
          'audit.action as action',
          'COUNT(*) as count',
          'MAX(audit.createdAt) as lastOccurrence',
        ])
        .groupBy('audit.action')
        .getRawMany();

      return summary;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException(
          'Failed to get audit summary: ' + error.message,
        );
      }
      throw new BadRequestException('Failed to get audit summary');
    }
  }

  private async handleCriticalChange(auditLog: AuditLog): Promise<void> {
    try {
      this.eventEmitter.emit('role.critical.change', {
        auditLog,
        timestamp: new Date(),
        severity: this.determineSeverity(auditLog.action),
      });

      await this.storeCriticalChange(auditLog);
    } catch (error: unknown) {
      console.error(
        'Failed to handle critical change:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  private determineSeverity(action: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    switch (action) {
      case RoleAuditAction.ROLE_DELETED:
      case RoleAuditAction.PERMISSION_ADDED:
        return 'HIGH';
      case RoleAuditAction.ROLE_UPDATED:
      case RoleAuditAction.PERMISSION_REMOVED:
        return 'MEDIUM';
      default:
        return 'LOW';
    }
  }

  private async storeCriticalChange(auditLog: AuditLog): Promise<void> {
    // Extend this method for custom critical storage (external service or DB)
  }

  private isCriticalRoleChange(action: string): boolean {
    const criticalActions = [
      RoleAuditAction.ROLE_DELETED,
      RoleAuditAction.PERMISSION_ADDED,
      RoleAuditAction.PERMISSION_REMOVED,
      RoleAuditAction.ROLE_UPDATED,
    ];
    return criticalActions.includes(action as RoleAuditAction);
  }
}
