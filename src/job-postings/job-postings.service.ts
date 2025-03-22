import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class JobPostingsService {
  constructor(
    @InjectRepository(JobPosting)
    private readonly jobRepository: Repository<JobPosting>,

    /** Injecting Notification service */
    private readonly notificationService: NotificationsService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    title?: string,
    company?: string,
    location?: string,
    sortBy: string = 'date',
    sortOrder: 'ASC' | 'DESC' = 'DESC', // Default: newest first
  ) {
    const where: any = {};

    if (title) {
      where.title = ILike(`%${title}%`);
    }
    if (location) {
      where.location = ILike(`%${location}%`);
    }
    if (company) {
      where.company = ILike(`%${company}%`);
    }

    // Define allowed sorting fields
    const validSortFields: Record<string, string> = {
      relevance: 'search_vector',
      date: 'createdAt', // Ensure jobs have a createdAt field
      salary: 'salary',
    };

    const orderByField = validSortFields[sortBy] || 'createdAt'; // Default to date
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [jobs, total] = await this.jobRepository.findAndCount({
      select: ['id', 'title', 'company', 'salary', 'location', 'createdAt'], // Fetch Only required columns
      where,
      order: { [orderByField]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { total, page, limit, sortBy, sortOrder, jobs };
  }
  async findOne(id: number) {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
    }
    return job;
  }

  async create(createJobDto: CreateJobDto) {
    const newJob = this.jobRepository.create(createJobDto);
    const savedJob = await this.jobRepository.save(newJob);

    /**  Send a notification when a job is posted */
    await this.notificationService.create({
      userId: 1, // Replace this with the actual job poster's userId
      type: 'job_posted',
      message: `A new job '${savedJob.title}' has been posted!`,
    });

    return savedJob;
  }

  async update(id: number, updateJobDto: UpdateJobDto) {
    const job = await this.findOne(id); // Ensure job exists before updating

    await this.jobRepository.update(id, updateJobDto);

    /** Notify users about the job update */
    await this.notificationService.create({
      userId: 1, // Replace with the job poster’s userId
      type: 'job_updated',
      message: `The job '${job.title}' has been updated.`,
    });

    return { message: 'Job updated successfully' };
  }

  /** Remove a job posting and notify */
  async remove(id: number) {
    const job = await this.findOne(id); // Ensure job exists before deleting

    const result = await this.jobRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
    }

    /** Notify users about job deletion */
    await this.notificationService.create({
      userId: 1, // Replace with the job poster’s userId
      type: 'job_deleted',
      message: `The job '${job.title}' has been deleted.`,
    });

    return { message: 'Job deleted successfully' };
  }
}
