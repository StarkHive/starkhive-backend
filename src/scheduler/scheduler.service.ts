import {
    Injectable,
    NotFoundException,
    ConflictException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Between, Repository, Not } from 'typeorm';
  import { InterviewSlot } from './entities/interview-slot.entity';
  import { CreateSlotDto } from './dto/create-slot.dto';
  import { UpdateSlotDto } from './dto/update-slot.dto';
  import { SlotQueryDto } from './dto/slot-query.dto';
  import { TimezoneHelper } from './utils/timezone.helper';
  import { IcsGenerator } from './calendar/ics.generator';
  
  @Injectable()
  export class SchedulerService {
    constructor(
      @InjectRepository(InterviewSlot)
      private readonly slotRepository: Repository<InterviewSlot>,
      private readonly timezoneHelper: TimezoneHelper,
      private readonly icsGenerator: IcsGenerator,
    ) {}
  
    async createSlot(createSlotDto: CreateSlotDto): Promise<InterviewSlot> {
      const normalizedSlot = this.timezoneHelper.normalizeSlotTimezone(createSlotDto);
      const conflicts = await this.checkForConflicts(normalizedSlot);
      
      if (conflicts.length > 0) {
        throw new ConflictException('Conflicting interview slots found');
      }
  
      const slot = this.slotRepository.create({
        ...normalizedSlot,
        status: 'proposed',
      });
      return this.slotRepository.save(slot);
    }
  
    async getSlotsForUser(userId: string, query: SlotQueryDto): Promise<InterviewSlot[]> {
      const where: any = { userId };
      
      if (query.fromDate && query.toDate) {
        where.startTime = Between(
          new Date(query.fromDate),
          new Date(query.toDate),
        );
      }
      
      if (query.status) {
        where.status = query.status;
      }
  
      return this.slotRepository.find({
        where,
        order: { startTime: 'ASC' },
      });
    }
  
    async updateSlot(id: string, updateSlotDto: UpdateSlotDto): Promise<InterviewSlot> {
      const slot = await this.slotRepository.findOne({ where: { id } });
      if (!slot) {
        throw new NotFoundException('Slot not found');
      }
    
      // Convert startTime and endTime from string to Date if needed:
      const startTime = updateSlotDto.startTime
        ? typeof updateSlotDto.startTime === 'string'
          ? new Date(updateSlotDto.startTime)
          : updateSlotDto.startTime
        : slot.startTime;
    
      const endTime = updateSlotDto.endTime
        ? typeof updateSlotDto.endTime === 'string'
          ? new Date(updateSlotDto.endTime)
          : updateSlotDto.endTime
        : slot.endTime;
    
      // Build updated slot object with correctly typed Date fields:
      const updatedSlot: InterviewSlot & { timezone: string } = {
        ...slot,
        ...updateSlotDto,
        startTime,
        endTime,
        timezone: updateSlotDto.timezone ?? slot.timezone,
      };
    
      // Normalize timezone (this will convert times to UTC dates)
      const normalizedSlot = this.timezoneHelper.normalizeSlotTimezone(updatedSlot);
    
      const conflicts = await this.checkForConflicts(normalizedSlot, id);
      if (conflicts.length > 0) {
        throw new ConflictException('Conflicting interview slots found');
      }
    
      return this.slotRepository.save(normalizedSlot);
    }
    
  
    async deleteSlot(id: string): Promise<{ message: string }> {
      const result = await this.slotRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Slot not found');
      }
      return { message: 'Slot deleted successfully' };
    }
  
    async generateIcsForSlot(id: string): Promise<string> {
      const slot = await this.slotRepository.findOne({ where: { id } });
      if (!slot) {
        throw new NotFoundException('Slot not found');
      }
      return this.icsGenerator.generateIcs(slot);
    }
  
    private async checkForConflicts(
      slot: Partial<InterviewSlot>,
      excludeId?: string,
    ): Promise<InterviewSlot[]> {
      const where: any = {
        userId: slot.userId,
        startTime: Between(slot.startTime, slot.endTime),
      };
  
      if (excludeId) {
        where.id = Not(excludeId);
      }
  
      return this.slotRepository.find({
        where,
      });
    }
  }