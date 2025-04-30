// src/availability-calendar/dto/set-availability.dto.ts

import {
    IsArray,
    ValidateNested,
    IsEnum,
    IsMilitaryTime,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export enum DayOfWeek {
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Saturday = 'Saturday',
    Sunday = 'Sunday',
  }
  
  export class AvailabilityEntryDto {
    @IsEnum(DayOfWeek, { message: 'Invalid day of the week' })
    dayOfWeek: DayOfWeek;
  
    @IsMilitaryTime({ message: 'Start time must be in HH:MM 24-hour format' })
    startTime: string;
  
    @IsMilitaryTime({ message: 'End time must be in HH:MM 24-hour format' })
    endTime: string;
  }
  
  export class SetAvailabilityDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AvailabilityEntryDto)
    entries: AvailabilityEntryDto[];
  }
  