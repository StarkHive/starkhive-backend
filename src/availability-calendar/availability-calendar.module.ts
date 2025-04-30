// src/availability-calendar/availability-calendar.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityCalendar } from './entities/availability-calendar.entity';
import { AvailabilityCalendarService } from './availability-calendar.service';
import { AvailabilityCalendarController } from './availability-calendar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AvailabilityCalendar])],
  providers: [AvailabilityCalendarService],
  controllers: [AvailabilityCalendarController],
})
export class AvailabilityCalendarModule {}
