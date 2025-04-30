import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchedulerService } from './scheduler.service';
import { InterviewSlot } from './entities/interview-slot.entity';
import { TimezoneHelper } from './utils/timezone.helper';
import { IcsGenerator } from './calendar/ics.generator';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let slotRepository: Repository<InterviewSlot>;
  let timezoneHelper: TimezoneHelper;
  let icsGenerator: IcsGenerator;

  const mockSlotRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockTimezoneHelper = {
    normalizeSlotTimezone: jest.fn().mockImplementation(slot => ({
      ...slot,
      startTime: new Date(slot.startTime),
      endTime: new Date(slot.endTime),
    })),
  };

  const mockIcsGenerator = {
    generateIcs: jest.fn().mockResolvedValue('ICS_DATA'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        {
          provide: getRepositoryToken(InterviewSlot),
          useValue: mockSlotRepository,
        },
        {
          provide: TimezoneHelper,
          useValue: mockTimezoneHelper,
        },
        {
          provide: IcsGenerator,
          useValue: mockIcsGenerator,
        },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
    slotRepository = module.get<Repository<InterviewSlot>>(
      getRepositoryToken(InterviewSlot),
    );
    timezoneHelper = module.get<TimezoneHelper>(TimezoneHelper);
    icsGenerator = module.get<IcsGenerator>(IcsGenerator);
  });

  describe('createSlot', () => {
    it('should create a new slot when no conflicts exist', async () => {
      const createSlotDto = {
        userId: 'user1',
        recruiterId: 'recruiter1',
        title: 'Interview',
        description: 'Technical interview',
        startTime: '2023-06-01T10:00:00',
        endTime: '2023-06-01T11:00:00',
        timezone: 'UTC',
      };

      mockSlotRepository.find.mockResolvedValue([]);
      mockSlotRepository.create.mockReturnValue(createSlotDto);
      mockSlotRepository.save.mockResolvedValue({
        ...createSlotDto,
        id: 'slot1',
        status: 'proposed',
      });

      const result = await service.createSlot(createSlotDto);
      expect(result).toHaveProperty('id', 'slot1');
      expect(result).toHaveProperty('status', 'proposed');
    });

    it('should throw ConflictException when conflicts exist', async () => {
      const createSlotDto = {
        userId: 'user1',
        recruiterId: 'recruiter1',
        title: 'Interview',
        description: 'Technical interview',
        startTime: '2023-06-01T10:00:00',
        endTime: '2023-06-01T11:00:00',
        timezone: 'UTC',
      };

      mockSlotRepository.find.mockResolvedValue([{ id: 'conflict-slot' }]);

      await expect(service.createSlot(createSlotDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getSlotsForUser', () => {
    it('should return slots for a user', async () => {
      const mockSlots = [
        {
          id: 'slot1',
          userId: 'user1',
          title: 'Interview 1',
          startTime: new Date(),
          endTime: new Date(),
        },
      ];

      mockSlotRepository.find.mockResolvedValue(mockSlots);

      const result = await service.getSlotsForUser('user1', {});
      expect(result).toEqual(mockSlots);
      expect(result.length).toBe(1);
    });
  });

  describe('updateSlot', () => {
    it('should update an existing slot', async () => {
      const existingSlot = {
        id: 'slot1',
        userId: 'user1',
        recruiterId: 'recruiter1',
        title: 'Old Title',
        description: 'Old Desc',
        startTime: new Date('2023-06-01T10:00:00'),
        endTime: new Date('2023-06-01T11:00:00'),
        timezone: 'UTC',
        status: 'proposed',
      };

      const updateDto = {
        title: 'New Title',
        status: 'confirmed',
      };

      mockSlotRepository.findOne.mockResolvedValue(existingSlot);
      mockSlotRepository.find.mockResolvedValue([]);
      mockSlotRepository.save.mockResolvedValue({
        ...existingSlot,
        ...updateDto,
      });

      const result = await service.updateSlot('slot1', updateDto);
      expect(result.title).toBe('New Title');
      expect(result.status).toBe('confirmed');
    });

    it('should throw NotFoundException when slot not found', async () => {
      mockSlotRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateSlot('nonexistent', { title: 'New Title' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteSlot', () => {
    it('should delete an existing slot', async () => {
      mockSlotRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteSlot('slot1');
      expect(result).toEqual({ message: 'Slot deleted successfully' });
    });

    it('should throw NotFoundException when slot not found', async () => {
      mockSlotRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteSlot('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('generateIcsForSlot', () => {
    it('should generate ICS data for a slot', async () => {
      const mockSlot = {
        id: 'slot1',
        title: 'Interview',
        description: 'Tech Interview',
        startTime: new Date(),
        endTime: new Date(),
        participants: ['test@example.com'],
      };

      mockSlotRepository.findOne.mockResolvedValue(mockSlot);

      const result = await service.generateIcsForSlot('slot1');
      expect(result).toBe('ICS_DATA');
    });

    it('should throw NotFoundException when slot not found', async () => {
      mockSlotRepository.findOne.mockResolvedValue(null);

      await expect(service.generateIcsForSlot('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});