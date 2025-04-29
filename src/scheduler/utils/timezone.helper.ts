import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { CreateSlotDto } from '../dto/create-slot.dto';
import { UpdateSlotDto } from '../dto/update-slot.dto';
import { InterviewSlot } from '../entities/interview-slot.entity';

@Injectable()
export class TimezoneHelper {
  normalizeSlotTimezone<T extends CreateSlotDto | UpdateSlotDto | InterviewSlot>(
    slot: T,
  ): T {
    const startTime = DateTime.fromISO(slot.startTime.toString(), {
      zone: slot.timezone,
    }).toUTC();
    const endTime = DateTime.fromISO(slot.endTime.toString(), {
      zone: slot.timezone,
    }).toUTC();

    return {
      ...slot,
      startTime: startTime.toJSDate(),
      endTime: endTime.toJSDate(),
    };
  }

  convertToUserTimezone(slot: InterviewSlot, targetTimezone: string) {
    const startTime = DateTime.fromJSDate(slot.startTime)
      .setZone('utc')
      .setZone(targetTimezone);
    const endTime = DateTime.fromJSDate(slot.endTime)
      .setZone('utc')
      .setZone(targetTimezone);

    return {
      ...slot,
      startTime: startTime.toJSDate(),
      endTime: endTime.toJSDate(),
      displayTimezone: targetTimezone,
    };
  }

  getAvailableTimezones(): string[] {
    return Intl.supportedValuesOf('timeZone');
  }
}