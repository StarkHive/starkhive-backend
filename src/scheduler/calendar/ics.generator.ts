import { Injectable } from '@nestjs/common';
import { InterviewSlot } from '../entities/interview-slot.entity';
import { createEvent } from 'ics';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IcsGenerator {
  async generateIcs(slot: InterviewSlot): Promise<string> {
    return new Promise((resolve, reject) => {
      const start = new Date(slot.startTime);
      const end = new Date(slot.endTime);

      const event = {
        uid: uuidv4(),
        start: [
          start.getFullYear(),
          start.getMonth() + 1,
          start.getDate(),
          start.getHours(),
          start.getMinutes(),
        ],
        end: [
          end.getFullYear(),
          end.getMonth() + 1,
          end.getDate(),
          end.getHours(),
          end.getMinutes(),
        ],
        title: slot.title,
        description: slot.description,
        location: slot.location || 'Online Meeting',
        organizer: { 
          name: 'Interview Scheduler', 
          email: 'noreply@interviews.com' 
        },
        attendees: this.generateAttendees(slot),
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
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
          resolve(value);
        }
      });
    });
  }

  private generateAttendees(slot: InterviewSlot): any[] {
    const attendees = [];
    
    if (slot.participants && slot.participants.length > 0) {
      attendees.push(...slot.participants.map(email => ({
        name: email.split('@')[0],
        email,
        rsvp: true,
        partstat: 'NEEDS-ACTION',
        role: 'REQ-PARTICIPANT',
      })));
    }

    return attendees;
  }
}