// 28. Create AuditModule (src/audit/audit.module.ts)
import { Module, MiddlewareConsumer, RequestMethod, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditLog } from './entitites/audit-log.entity';
import { RoleAuditMiddleware } from './middleware/role-audit.middleware';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RoleAuditMiddleware)
      .forRoutes(
        { path: 'roles*', method: RequestMethod.POST },
        { path: 'roles*', method: RequestMethod.PUT },
        { path: 'roles*', method: RequestMethod.PATCH },
        { path: 'roles*', method: RequestMethod.DELETE },
      );
  }
}