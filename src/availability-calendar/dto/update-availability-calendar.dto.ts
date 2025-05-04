import { PartialType } from '@nestjs/swagger';
import { AvailabilitySchedule } from './create-availability-calendar.dto';

export class UpdateAvailabilityCalendarDto extends PartialType(AvailabilitySchedule) {}
