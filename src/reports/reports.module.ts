// src/reports/reports.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { ReportsRepository } from './reports.repository';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { NotificationsModule } from '../notifications/notifications.module'; // Import NotificationsModule
import { Appeal } from './appeal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, Appeal]), NotificationsModule], // Import NotificationsModule
  providers: [ReportsRepository, ReportsService],
  controllers: [ReportsController],
  exports: [ReportsRepository],
})
export class ReportsModule {}