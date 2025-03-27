import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTrackingController } from './time-tracking.controller';
import { TimeTrackingService } from './time-tracking.service';
import { TimeEntry } from './entities/time-entry.entity';
import { Project } from '../project/entities/project.entity';
import { PaymentModule } from '@src/payment/payment.module';

@Module({
  imports: [PaymentModule, TypeOrmModule.forFeature([TimeEntry, Project])],
  controllers: [TimeTrackingController],
  providers: [TimeTrackingService],
  exports: [TimeTrackingService],
})
export class TimeTrackingModule {}
