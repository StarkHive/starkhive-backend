import { EntityRepository, Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@EntityRepository(AuditLog)
export class AuditLogRepository extends Repository<AuditLog> {}
