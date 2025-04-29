import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { InterviewSlot } from './entities/interview-slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InterviewSlot])],
  controllers: [SchedulerController],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}