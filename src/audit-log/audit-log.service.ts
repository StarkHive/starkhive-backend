import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from './audit-log.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLogRepository)
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async logAction(action: string, performedBy: string, details?: Record<string, any>) {
    const auditLog = this.auditLogRepository.create({ action, performedBy, details });
    await this.auditLogRepository.save(auditLog);
  }

  // Ensure the getAllLogs method exists
  async getAllLogs() {
    return this.auditLogRepository.find();
  }
}
