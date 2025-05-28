import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { InterviewSlot } from './entities/interview-slot.entity';
import { TimezoneHelper } from './utils/timezone.helper';
import { IcsGenerator } from './calendar/ics.generator';

@Module({
  imports: [TypeOrmModule.forFeature([InterviewSlot])],
  controllers: [SchedulerController],
  providers: [SchedulerService, TimezoneHelper,  InterviewSlot, IcsGenerator],
  exports: [SchedulerService, TimezoneHelper],
})
export class SchedulerModule {}