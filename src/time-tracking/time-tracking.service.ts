import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeEntry } from './entities/time-entry.entity';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { StartTrackingDto } from './dto/start-tracking.dto';
import { TimeEntryChartData } from './dto/report-response.dto';
import { User } from '../user/entities/user.entity';
import { Project } from '../project/entities/project.entity';
import { ExportUtils } from './utils/export.utils';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class TimeTrackingService {
  private activeTracking: Map<string, TimeEntry> = new Map();

  constructor(
    @InjectRepository(TimeEntry)
    private timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private paymentService: PaymentService,
  ) {}

  async startTracking(freelancer: User, startTrackingDto: StartTrackingDto): Promise<TimeEntry> {
    // Check if user already has active tracking
    if (this.activeTracking.has(freelancer.id)) {
      throw new BadRequestException('Already tracking time for another task');
    }

    const project = await this.projectRepository.findOne({ where: { id: startTrackingDto.projectId }});
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const timeEntry = this.timeEntryRepository.create({
      freelancer,
      project,
      startTime: new Date(),
      description: startTrackingDto.description,
    });

    const savedEntry = await this.timeEntryRepository.save(timeEntry);
    this.activeTracking.set(freelancer.id, savedEntry);
    return savedEntry;
  }

  async stopTracking(freelancerId: string): Promise<TimeEntry> {
    const activeEntry = this.activeTracking.get(freelancerId);
    if (!activeEntry) {
      throw new BadRequestException('No active time tracking found');
    }

    activeEntry.endTime = new Date();
    const duration = (activeEntry.endTime.getTime() - activeEntry.startTime.getTime()) / (1000 * 60 * 60);
    activeEntry.duration = Number(duration.toFixed(2));

    const savedEntry = await this.timeEntryRepository.save(activeEntry);
    this.activeTracking.delete(freelancerId);
    return savedEntry;
  }

  async getActiveTracking(freelancerId: string): Promise<TimeEntry | null> {
    return this.activeTracking.get(freelancerId) || null;
  }

  async createTimeEntry(freelancer: User, createTimeEntryDto: CreateTimeEntryDto): Promise<TimeEntry> {
    const project = await this.projectRepository.findOne({ where: { id: createTimeEntryDto.projectId }});
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const timeEntry = this.timeEntryRepository.create({
      freelancer,
      project,
      ...createTimeEntryDto,
    });

    if (createTimeEntryDto.endTime) {
      const duration = (createTimeEntryDto.endTime.getTime() - createTimeEntryDto.startTime.getTime()) / (1000 * 60 * 60);
      timeEntry.duration = Number(duration.toFixed(2));
    }

    return this.timeEntryRepository.save(timeEntry);
  }

  async getFreelancerTimeEntries(freelancerId: string): Promise<TimeEntry[]> {
    return this.timeEntryRepository.find({
      where: { freelancer: { id: freelancerId } },
      relations: ['project'],
      order: { startTime: 'DESC' },
    });
  }

  async getProjectTimeEntries(projectId: string): Promise<TimeEntry[]> {
    return this.timeEntryRepository.find({
      where: { project: { id: projectId } },
      relations: ['freelancer'],
      order: { startTime: 'DESC' },
    });
  }

  async approveTimeEntry(timeEntryId: string, approverId: string): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryRepository.findOne({ 
      where: { id: timeEntryId },
      relations: ['project', 'freelancer', 'project.contract']
    });
    
    if (!timeEntry) {
      throw new NotFoundException('Time entry not found');
    }

    if (timeEntry.isApproved) {
      throw new BadRequestException('Time entry already approved');
    }

    timeEntry.isApproved = true;
    timeEntry.approvedBy = approverId;
    timeEntry.approvedAt = new Date();

    const savedEntry = await this.timeEntryRepository.save(timeEntry);

    // Generate invoice after approval
    await this.paymentService.generateInvoice({
      timeEntry: savedEntry,
      amount: savedEntry.duration * timeEntry.project.hourlyRate,
      freelancerId: timeEntry.freelancer.id,
      projectId: timeEntry.project.id,
      description: `Time entry for ${savedEntry.duration} hours on ${timeEntry.project.name}`
    });

    return savedEntry;
  }

  async generateReport(freelancerId: string, startDate: Date, endDate: Date) {
    const timeEntries = await this.timeEntryRepository
      .createQueryBuilder('timeEntry')
      .leftJoinAndSelect('timeEntry.project', 'project')
      .where('timeEntry.freelancer.id = :freelancerId', { freelancerId })
      .andWhere('timeEntry.startTime >= :startDate', { startDate })
      .andWhere('timeEntry.startTime <= :endDate', { endDate })
      .getMany();

    const totalHours = timeEntries.reduce((sum: number, entry: TimeEntry) => sum + entry.duration, 0);
    
    // Group by project
    const projectSummary = timeEntries.reduce((acc: Record<string, any>, entry: TimeEntry) => {
      const projectId = entry.project.id;
      if (!acc[projectId]) {
        acc[projectId] = {
          projectName: entry.project.name,
          totalHours: 0,
          entries: [],
        };
      }
      acc[projectId].totalHours += entry.duration;
      acc[projectId].entries.push(entry);
      return acc;
    }, {});

    // Generate chart data
    const dailyData = timeEntries.reduce((acc: Record<string, TimeEntryChartData>, entry: TimeEntry) => {
      const date = entry.startTime.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          hours: 0,
          project: entry.project.name
        };
      }
      acc[date].hours += entry.duration;
      return acc;
    }, {});

    const projectChartData = {
      labels: Object.values(projectSummary).map((p: any) => p.projectName),
      data: Object.values(projectSummary).map((p: any) => p.totalHours)
    };

    return {
      totalHours,
      projectSummary,
      timeEntries,
      chartData: {
        daily: Object.values(dailyData),
        byProject: projectChartData
      }
    };
  }

  async exportToCSV(freelancerId: string, startDate: Date, endDate: Date): Promise<string> {
    const timeEntries = await this.timeEntryRepository
      .createQueryBuilder('timeEntry')
      .leftJoinAndSelect('timeEntry.project', 'project')
      .leftJoinAndSelect('timeEntry.freelancer', 'freelancer')
      .where('timeEntry.freelancer.id = :freelancerId', { freelancerId })
      .andWhere('timeEntry.startTime >= :startDate', { startDate })
      .andWhere('timeEntry.startTime <= :endDate', { endDate })
      .getMany();

    return ExportUtils.generateCSV(timeEntries);
  }

  async exportToPDF(freelancerId: string, startDate: Date, endDate: Date): Promise<Buffer> {
    const timeEntries = await this.timeEntryRepository
      .createQueryBuilder('timeEntry')
      .leftJoinAndSelect('timeEntry.project', 'project')
      .leftJoinAndSelect('timeEntry.freelancer', 'freelancer')
      .where('timeEntry.freelancer.id = :freelancerId', { freelancerId })
      .andWhere('timeEntry.startTime >= :startDate', { startDate })
      .andWhere('timeEntry.startTime <= :endDate', { endDate })
      .getMany();

    return ExportUtils.generatePDF(timeEntries);
  }
}
