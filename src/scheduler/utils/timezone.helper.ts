import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { CreateSlotDto } from '../dto/create-slot.dto';
import { UpdateSlotDto } from '../dto/update-slot.dto';
import { InterviewSlot } from '../entities/interview-slot.entity';

type SlotWithTimezone = (CreateSlotDto | UpdateSlotDto | InterviewSlot) & { timezone: string };

@Injectable()
export class TimezoneHelper {
  normalizeSlotTimezone<T extends SlotWithTimezone>(
    slot: T,
  ): Omit<T, 'startTime' | 'endTime'> & { startTime: Date; endTime: Date } {
    if (!slot.startTime || !slot.endTime) {
      throw new Error('startTime and endTime must be defined');
    }

    // Convert startTime to Date
    const startTime = typeof slot.startTime === 'string'
      ? DateTime.fromISO(slot.startTime, { zone: slot.timezone }).toUTC()
      : DateTime.fromJSDate(slot.startTime).setZone(slot.timezone).toUTC();

    // Convert endTime to Date
    const endTime = typeof slot.endTime === 'string'
      ? DateTime.fromISO(slot.endTime, { zone: slot.timezone }).toUTC()
      : DateTime.fromJSDate(slot.endTime).setZone(slot.timezone).toUTC();

    return {
      ...slot,
      startTime: startTime.toJSDate(),
      endTime: endTime.toJSDate(),
    };
  }

  convertToUserTimezone(slot: InterviewSlot, targetTimezone: string): InterviewSlot & { displayTimezone: string } {
    const startTime = DateTime.fromJSDate(slot.startTime).setZone(targetTimezone);
    const endTime = DateTime.fromJSDate(slot.endTime).setZone(targetTimezone);

    return {
      ...slot,
      startTime: startTime.toJSDate(),
      endTime: endTime.toJSDate(),
      displayTimezone: targetTimezone,
    };
  }

  // Fallback for unsupported environments
  getAvailableTimezones(): string[] {
    if (typeof (Intl as any).supportedValuesOf === 'function') {
      return (Intl as any).supportedValuesOf('timeZone');
    }
    // fallback list or empty array
    return [
      'UTC',
      'America/New_York',
      'Europe/London',
      'Asia/Tokyo',
      'Australia/Sydney',
      // add more if needed
    ];
  }
}
