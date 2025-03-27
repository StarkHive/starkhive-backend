import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, LessThanOrEqual, Not, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Project } from './entities/project.entity';
import { Milestone, MilestoneStatus } from './entities/milestone.entity';
import { Deliverable, DeliverableStatus } from './entities/deliverable.entity';
import { Task, TaskStatus } from './entities/task.entity';
import moment from 'moment';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
    
    @InjectRepository(Deliverable)
    private deliverableRepository: Repository<Deliverable>,
    
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  // Run every day at 8:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkUpcomingDeadlines() {
    this.logger.log('Checking upcoming deadlines...');
    
    const today = new Date();
    const threeDaysFromNow = moment().add(3, 'days').toDate();
    const oneDayFromNow = moment().add(1, 'day').toDate();
    
    await this.checkUpcomingMilestones(today, threeDaysFromNow, oneDayFromNow);
    await this.checkUpcomingDeliverables(today, threeDaysFromNow, oneDayFromNow);
    await this.checkUpcomingTasks(today, threeDaysFromNow, oneDayFromNow);
    await this.checkOverdueItems(today);
    
    this.logger.log('Deadline check completed');
  }

  private async checkUpcomingMilestones(today: Date, threeDaysFromNow: Date, oneDayFromNow: Date) {
    // Find milestones due in the next 3 days (excluding those already completed)
    const upcomingMilestones = await this.milestoneRepository.find({
      where: {
        dueDate: LessThanOrEqual(threeDaysFromNow),
        status: Not(MilestoneStatus.COMPLETED),
      },
      relations: ['project', 'project.client', 'project.projectManager'],
    });
    
    for (const milestone of upcomingMilestones) {
      const dueDate = new Date(milestone.dueDate);
      const daysUntilDue = moment(dueDate).diff(today, 'days');
      
      // Determine urgency of notification based on due date
      if (daysUntilDue <= 0) {
        this.logger.warn(
          `URGENT: Milestone "${milestone.title}" for project "${milestone.project.name}" is due today!`,
        );
        // Send notification here (using notification service)
      } else if (daysUntilDue === 1) {
        this.logger.log(
          `REMINDER: Milestone "${milestone.title}" for project "${milestone.project.name}" is due tomorrow!`,
        );
        // Send notification here (using notification service)
      } else {
        this.logger.log(
          `REMINDER: Milestone "${milestone.title}" for project "${milestone.project.name}" is due in ${daysUntilDue} days`,
        );
        // Send notification here (using notification service)
      }
    }
  }

  private async checkUpcomingDeliverables(today: Date, threeDaysFromNow: Date, oneDayFromNow: Date) {
    // Find deliverables due in the next 3 days (excluding those already approved)
    const upcomingDeliverables = await this.deliverableRepository.find({
      where: {
        dueDate: LessThanOrEqual(threeDaysFromNow),
        status: Not(In([DeliverableStatus.APPROVED, DeliverableStatus.REJECTED])),
      },
      relations: ['project', 'milestone', 'project.client', 'project.projectManager'],
    });
    
    for (const deliverable of upcomingDeliverables) {
      const dueDate = new Date(deliverable.dueDate);
      const daysUntilDue = moment(dueDate).diff(today, 'days');
      
      // Determine urgency of notification based on due date
      if (daysUntilDue <= 0) {
        this.logger.warn(
          `URGENT: Deliverable "${deliverable.name}" for project "${deliverable.project.name}" is due today!`,
        );
        // Send notification here (using notification service)
      } else if (daysUntilDue === 1) {
        this.logger.log(
          `REMINDER: Deliverable "${deliverable.name}" for project "${deliverable.project.name}" is due tomorrow!`,
        );
        // Send notification here (using notification service)
      } else {
        this.logger.log(
          `REMINDER: Deliverable "${deliverable.name}" for project "${deliverable.project.name}" is due in ${daysUntilDue} days`,
        );
        // Send notification here (using notification service)
      }
    }
  }

  private async checkUpcomingTasks(today: Date, threeDaysFromNow: Date, oneDayFromNow: Date) {
    // Find tasks due in the next 3 days (excluding those already done)
    const upcomingTasks = await this.taskRepository.find({
      where: {
        dueDate: LessThanOrEqual(threeDaysFromNow),
        status: Not(TaskStatus.DONE),
      },
      relations: ['project', 'assignees', 'project.projectManager'],
    });
    
    for (const task of upcomingTasks) {
      if (!task.dueDate) continue; // Skip tasks without due dates
      
      const dueDate = new Date(task.dueDate);
      const daysUntilDue = moment(dueDate).diff(today, 'days');
      
      // For each assignee of the task
      if (task.assignees && task.assignees.length > 0) {
        for (const assignee of task.assignees) {
          // Determine urgency of notification based on due date
          if (daysUntilDue <= 0) {
            this.logger.warn(
              `URGENT: Task "${task.title}" for project "${task.project.name}" assigned to ${assignee.username} is due today!`,
            );
            // Send notification to assignee (using notification service)
          } else if (daysUntilDue === 1) {
            this.logger.log(
              `REMINDER: Task "${task.title}" for project "${task.project.name}" assigned to ${assignee.username} is due tomorrow!`,
            );
            // Send notification to assignee (using notification service)
          } else {
            this.logger.log(
              `REMINDER: Task "${task.title}" for project "${task.project.name}" assigned to ${assignee.username} is due in ${daysUntilDue} days`,
            );
            // Send notification to assignee (using notification service)
          }
        }
      }
      
      // Also notify project manager
      if (task.project.projectManager) {
        if (daysUntilDue <= 0) {
          this.logger.warn(
            `URGENT: Task "${task.title}" for project "${task.project.name}" is due today!`,
          );
          // Send notification to project manager (using notification service)
        }
      }
    }
  }

  private async checkOverdueItems(today: Date) {
    // Update milestone statuses if they're overdue
    const overdueMilestones = await this.milestoneRepository.find({
      where: {
        dueDate: LessThan(today),
        status: Not(In([MilestoneStatus.COMPLETED, MilestoneStatus.OVERDUE])),
      },
    });
    
    for (const milestone of overdueMilestones) {
      milestone.status = MilestoneStatus.OVERDUE;
      await this.milestoneRepository.save(milestone);
      this.logger.warn(
        `Updated milestone "${milestone.title}" (ID: ${milestone.id}) status to OVERDUE`,
      );
      // Send notification here (using notification service)
    }
    
    // Check for other overdue items and send notifications
    // This would be similar to the above milestone check, but for tasks and deliverables
  }
} 