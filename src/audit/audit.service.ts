
// 30. Create AuditService (src/audit/audit.service.ts)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAuditLogDto } from './dto/audit-log.dto';
import { AuditLog } from './entitites/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async createLog(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(createAuditLogDto);
    return this.auditLogRepository.save(auditLog);
  }

  async findAll(page = 1, limit = 20, userId?: string, action?: string) {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.user', 'user');
    
    if (userId) {
      queryBuilder.andWhere('auditLog.userId = :userId', { userId });
    }
    
    if (action) {
      queryBuilder.andWhere('auditLog.action LIKE :action', { action: `%${action}%` });
    }
    
    queryBuilder
      .orderBy('auditLog.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    
    const [items, total] = await queryBuilder.getManyAndCount();
    
    return {
      items,
      total,
      page,
      limit,
    };
  }
}