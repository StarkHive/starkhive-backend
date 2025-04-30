import { PartialType } from '@nestjs/swagger';
import { CreateAvailabilityCalendarDto } from './create-availability-calendar.dto';

export class UpdateAvailabilityCalendarDto extends PartialType(CreateAvailabilityCalendarDto) {}
