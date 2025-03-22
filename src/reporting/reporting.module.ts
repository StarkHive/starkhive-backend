
// 40. Create ReportingModule (src/reporting/reporting.module.ts)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { Report } from './entities/report.entity';
import { AuditModule } from '@src/audit/audit.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    AuditModule,
  ],
  providers: [ReportingService],
  controllers: [ReportingController],
  exports: [ReportingService],
})
export class ReportingModule {}
