import { Injectable, HttpException, HttpStatus } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, ILike } from "typeorm"
import { JobPosting } from "./entities/job-posting.entity"
import { CreateJobDto } from "./dto/create-job.dto"
import { UpdateJobDto } from "./dto/update-job.dto"
import { NotificationsService } from "src/notifications/notifications.service"
import { Logger } from "@nestjs/common"

@Injectable()
export class JobPostingsService {
  private readonly logger = new Logger(JobPostingsService.name);

  constructor(
    @InjectRepository(JobPosting)
    private readonly jobRepository: Repository<JobPosting>,

    /** Injecting Notification service */
    private readonly notificationService: NotificationsService,
  ) {}

  async findAll(
    page = 1,
    limit = 10,
    title?: string,
    company?: string,
    location?: string,
    sortBy = "date",
    sortOrder: "ASC" | "DESC" = "DESC", // Default: newest first
  ) {
    const where: any = {}

    if (title) {
      where.title = ILike(`%${title}%`)
    }
    if (location) {
      where.location = ILike(`%${location}%`)
    }
    if (company) {
      where.company = ILike(`%${company}%`)
    }

    // Define allowed sorting fields
    const validSortFields: Record<string, string> = {
      relevance: "search_vector",
      date: "createdAt", // Ensure jobs have a createdAt field
      salary: "salary",
    }

    const orderByField = validSortFields[sortBy] || "createdAt" // Default to date
    const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC"

    const [jobs, total] = await this.jobRepository.findAndCount({
      select: ["id", "title", "company", "salary", "location", "createdAt"], // Fetch Only required columns
      where,
      order: { [orderByField]: order },
      skip: (page - 1) * limit,
      take: limit,
    })

    return { total, page, limit, sortBy, sortOrder, jobs }
  }

  async findOne(id: number) {
    const job = await this.jobRepository.findOne({ where: { id } })
    if (!job) {
      throw new HttpException("Job not found", HttpStatus.NOT_FOUND)
    }
    return job
  }

  async create(createJobDto: CreateJobDto) {
    const newJob = this.jobRepository.create(createJobDto)
    const savedJob = await this.jobRepository.save(newJob)

    // Prepare job data for the notification
    const jobData = {
      id: savedJob.id,
      title: savedJob.title,
      company: savedJob.company,
      salary: savedJob.salary,
      location: savedJob.location,
    }

    try {
      /** Send a notification when a job is posted */
      await this.notificationService.create({
        userId: 1, // Replace this with the actual job poster's userId
        type: "job_posted",
        message: `A new job '${savedJob.title}' has been posted!`,
        data: jobData,
      })

      /** Broadcast to all connected users */
      await this.notificationService.broadcastNotification(
        "new_job_posting",
        `New job opportunity: ${savedJob.title} at ${savedJob.company}`,
        jobData,
      )
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Failed to send job posting notification: ${error.message}`, error.stack)
      } else {
        this.logger.error(`Failed to send job posting notification: Unknown error`, String(error))
      }
      // Continue execution - don't fail the job creation if notification fails
    }

    return savedJob
  }

  async update(id: number, updateJobDto: UpdateJobDto) {
    const job = await this.findOne(id) // Ensure job exists before updating

    await this.jobRepository.update(id, updateJobDto)

    const updatedJob = await this.findOne(id)

    try {
      /** Notify users about the job update */
      await this.notificationService.create({
        userId: 1, // Replace with the job poster's userId
        type: "job_updated",
        message: `The job '${job.title}' has been updated.`,
        data: {
          id: updatedJob.id,
          title: updatedJob.title,
          company: updatedJob.company,
          salary: updatedJob.salary,
          location: updatedJob.location,
          previousTitle: job.title !== updatedJob.title ? job.title : undefined,
        },
      })

      /** Broadcast the update to interested users */
      await this.notificationService.broadcastNotification(
        "job_posting_updated",
        `Job posting updated: ${updatedJob.title} at ${updatedJob.company}`,
        {
          id: updatedJob.id,
          title: updatedJob.title,
          company: updatedJob.company,
          salary: updatedJob.salary,
          location: updatedJob.location,
        },
      )
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Failed to send job update notification: ${error.message}`, error.stack)
      } else {
        this.logger.error(`Failed to send job update notification: Unknown error`, String(error))
      }
      // Continue execution - don't fail the job update if notification fails
    }

    return { message: "Job updated successfully", job: updatedJob }
  }

  /** Remove a job posting and notify */
  async remove(id: number) {
    const job = await this.findOne(id) // Ensure job exists before deleting

    const result = await this.jobRepository.delete(id)
    if (result.affected === 0) {
      throw new HttpException("Job not found", HttpStatus.NOT_FOUND)
    }

    try {
      /** Notify users about job deletion */
      await this.notificationService.create({
        userId: 1, // Replace with the job poster's userId
        type: "job_deleted",
        message: `The job '${job.title}' has been deleted.`,
        data: {
          id: job.id,
          title: job.title,
          company: job.company,
        },
      })

      /** Broadcast the deletion to all interested users */
      await this.notificationService.broadcastNotification(
        "job_posting_removed",
        `Job posting removed: ${job.title} at ${job.company}`,
        {
          id: job.id,
          title: job.title,
          company: job.company,
        },
      )
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Failed to send job deletion notification: ${error.message}`, error.stack)
      } else {
        this.logger.error(`Failed to send job deletion notification: Unknown error`, String(error))
      }
      // Continue execution - notification failure shouldn't affect the deletion
    }

    return { message: "Job deleted successfully" }
  }
}