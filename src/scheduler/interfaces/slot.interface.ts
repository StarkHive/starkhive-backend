import { DateTime } from 'luxon';

export interface ISlot {
  id: string;
  userId: string;
  recruiterId: string;
  title: string;
  description: string;
  startTime: DateTime;
  endTime: DateTime;
  timezone: string;
  location?: string;
  participants?: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}