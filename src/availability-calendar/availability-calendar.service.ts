// src/availability-calendar/availability-calendar.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AvailabilityCalendar } from './entities/availability-calendar.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AvailabilityCalendarService {
  constructor(
    @InjectRepository(AvailabilityCalendar)
    private readonly availabilityRepo: Repository<AvailabilityCalendar>,
  ) {}

  async setAvailability(userId: number, entries: { dayOfWeek: string; startTime: string; endTime: string }[]) {
    await this.availabilityRepo.delete({ user: { id: userId.toString() } });

    const records = entries.map((entry) =>
      this.availabilityRepo.create({
        user: { id: userId.toString() }, // Fix type
        ...entry,
      }),
    );
    return this.availabilityRepo.save(records);
  }

  async getAvailability(userId: number) {
    return this.availabilityRepo.find({
      where: { user: { id: userId.toString() } },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async findAvailableFreelancers(dayOfWeek: string, time: string) {
    return this.availabilityRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.user', 'user')
      .where('a.dayOfWeek = :dayOfWeek', { dayOfWeek })
      .andWhere('a.startTime <= :time AND a.endTime > :time', { time })
      .getMany();
  }
}
