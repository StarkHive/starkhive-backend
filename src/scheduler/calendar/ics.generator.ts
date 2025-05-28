import { Injectable } from '@nestjs/common';
import { InterviewSlot } from '../entities/interview-slot.entity';
import { createEvent, EventAttributes, EventStatus } from 'ics';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IcsGenerator {
  async generateIcs(slot: InterviewSlot): Promise<string> {
    return new Promise((resolve, reject) => {
      const startDate = new Date(slot.startTime);
      const endDate = new Date(slot.endTime);

      const start: [number, number, number, number, number] = [
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
        startDate.getHours(),
        startDate.getMinutes(),
      ];

      const end: [number, number, number, number, number] = [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
        endDate.getHours(),
        endDate.getMinutes(),
      ];

      // Use EventStatus type here:
      const status: EventStatus = 'CONFIRMED';

      const event: EventAttributes = {
        uid: uuidv4(),
        start,
        end,
        title: slot.title,
        description: slot.description,
        location: slot.location || 'Online Meeting',
        organizer: {
          name: 'Interview Scheduler',
          email: 'noreply@interviews.com',
        },
        attendees: this.generateAttendees(slot),
        status,  // Correctly typed
        alarms: [
          {
            action: 'display',
            description: 'Reminder',
            trigger: { hours: 1, minutes: 0, before: true },
          },
        ],
      };

      createEvent(event, (error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve(value || '');
        }
      });
    });
  }

  private generateAttendees(slot: InterviewSlot): any[] {
    if (!slot.participants) return [];
    return slot.participants.map(email => ({
      name: email.split('@')[0],
      email,
      rsvp: true,
      partstat: 'NEEDS-ACTION',
      role: 'REQ-PARTICIPANT',
    }));
  }
}
