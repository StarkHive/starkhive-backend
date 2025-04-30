/* eslint-disable @typescript-eslint/no-require-imports */
import { Injectable, NotFoundException, Inject, forwardRef } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, EntityManager } from "typeorm"
import * as nodemailer from "nodemailer"
import { NotificationSettingsService } from "../notification-settings/notification-settings.service"
import { JobNotification } from "./entities/job-notification.entities"
import { SseService } from "../sse/sse.service"
import { NotificationEventDto } from "./dto/notification-event.dto"
import { Logger } from "@nestjs/common"
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { Notification, NotificationStatus, DigestFrequency } from './entities/notification.entity'
import { NotificationPreference } from './entities/notification-preference.entity'
import { UpdateNotificationPreferenceDto } from './dto/notification-preference.dto'
import { TriggerNotificationDto } from './dto/trigger-notification.dto'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: "your-email@gmail.com", pass: "your-password" },
  });

  // private twilioClient = Twilio(
  //   process.env.TWILIO_ACCOUNT_SID,
  //   process.env.TWILIO_AUTH_TOKEN,
  // );

  constructor(
    private readonly notificationSettingsService: NotificationSettingsService,
    @InjectRepository(JobNotification)
    private readonly jobNotificationRepository: Repository<JobNotification>,
    @Inject(forwardRef(() => SseService))
    private readonly sseService: SseService,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepository: Repository<NotificationPreference>,
    @InjectQueue('notifications')
    private notificationsQueue: Queue,
  ) {}

  public async create(createNotificationDto: {
    userId: string | number
    type: string
    message: string
    data?: any
  }, entityManager?: EntityManager) {
    const { userId, type, message, data } = createNotificationDto
    const numericUserId = typeof userId === "string" ? Number.parseInt(userId, 10) : userId

    // Create and save notification in database
    const notification = this.notificationRepository.create({
      userId: numericUserId,
      type,
      message,
    })
    
    // Use provided entityManager or fall back to repository
    const saveRepo = entityManager?.getRepository(Notification) || this.notificationRepository
    await saveRepo.save(notification)

    // Emit real-time SSE notification
    this.emitSseNotification(
      type,
      {
        id: notification.id,
        message,
        type,
        createdAt: notification.createdAt,
        read: notification.read,
        ...data,
      },
      numericUserId,
    )

    // Handle traditional notification channels
    try {
      const settings = await this.notificationSettingsService.getSettings(numericUserId)
      if (settings.email) {
        await this.sendEmail("user@example.com", "New Notification", message)
      }
      if (settings.push) {
        this.sendPushNotification(numericUserId, message)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Failed to process notification settings: ${error.message}`, error.stack)
      } else {
        this.logger.error(`Failed to process notification settings: Unknown error`, String(error))
      }
    }

    return notification
  }

  public async createMentionNotification(mentionedUserId: string, commentId: string, data?: any) {
    const userId = +mentionedUserId
    const message = `You were mentioned in comment: ${commentId}`

    // Create and save notification in database
    const notification = this.notificationRepository.create({
      userId,
      type: "mention",
      message,
    })
    await this.notificationRepository.save(notification)

    // Emit real-time SSE notification
    this.emitSseNotification(
      "mention",
      {
        id: notification.id,
        message,
        commentId,
        createdAt: notification.createdAt,
        read: notification.read,
        ...data,
      },
      userId,
    )

    // Handle traditional notification channels
    try {
      const settings = await this.notificationSettingsService.getSettings(userId)
      if (settings.email) {
        await this.sendEmail("user@example.com", "You were mentioned", message)
      }
      if (settings.push) {
        this.sendPushNotification(userId, message)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Failed to process notification settings: ${error.message}`, error.stack)
      } else {
        this.logger.error(`Failed to process notification settings: Unknown error`, String(error))
      }
    }

    return notification
  }

  public async findByUser(userId: number) {
    return await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    })
  }

  public async markAsRead(id: number, read: boolean) {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    })
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`)
    }
    notification.read = read
    const updated = await this.notificationRepository.save(notification)

    // Also update the SSE clients about this change
    this.emitSseNotification(
      "notification_status_changed",
      {
        id: notification.id,
        read: notification.read,
      },
      notification.userId,
    )

    return updated
  }

  public async sendEmail(to: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: "your-email@gmail.com",
      to,
      subject,
      text,
    })
  }

  /**Send SMS */
  // public async sendSMS(to: string, message: string) {
  //   // await this.twilioClient.messages.create({
  //   //   body: message,
  //   //   from: 'your-twilio-number',
  //   //   to,
  //   // });
  // }

  /** Mock Push Notification */
  private sendPushNotification(userId: number, message: string) {
    console.log(`Sending Push Notification to User ${userId}: ${message}`)
  }

  /**
   * Emit an SSE notification event
   */
  private emitSseNotification(type: string, data: any, userId?: number) {
    try {
      const event = new NotificationEventDto({
        type,
        message: data.message || "",
        data,
        userId,
      })

      this.sseService.emit({
        type,
        data,
        userId,
      })

      this.logger.debug(`Emitted SSE notification of type ${type} for user ${userId || "broadcast"}`)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Failed to emit SSE notification: ${error.message}`, error.stack)
      } else {
        this.logger.error(`Failed to emit SSE notification: Unknown error`, String(error))
      }
    }
  }

  /**
   * Broadcast a notification to all connected clients
   */
  public async broadcastNotification(type: string, message: string, data?: any) {
    // Create a record for tracking purposes
    const notification = this.notificationRepository.create({
      userId: 0, // Special ID for broadcast
      type,
      message,
    })
    await this.notificationRepository.save(notification)

    // Emit the SSE event without a specific userId (broadcast)
    this.emitSseNotification(type, {
      id: notification.id,
      message,
      type,
      createdAt: notification.createdAt,
      ...data,
    })

    return notification
  }

  async updatePreferences(
    userId: string,
    dto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    let preference = await this.preferenceRepository.findOne({
      where: {
        userId,
        notificationType: dto.notificationType,
      },
    });

    if (!preference) {
      preference = this.preferenceRepository.create({
        userId,
        ...dto,
      });
    } else {
      Object.assign(preference, dto);
    }

    return this.preferenceRepository.save(preference);
  }

  async triggerNotification(dto: TriggerNotificationDto): Promise<Notification> {
    const preference = await this.preferenceRepository.findOne({
      where: {
        userId: dto.userId,
        notificationType: dto.type,
      },
    });

    if (!preference || !preference.enabled) {
      this.logger.warn(`Notifications disabled for user ${dto.userId} and type ${dto.type}`);
      return null;
    }

    const notification = await this.notificationRepository.save({
      userId: dto.userId,
      type: dto.type,
      content: dto.content,
      deliveryChannel: dto.deliveryChannel || preference.deliveryChannels[0],
      status: NotificationStatus.PENDING,
      priority: dto.priority || 0,
      scheduledFor: dto.scheduledFor,
    });

    if (preference.digestFrequency === DigestFrequency.IMMEDIATE) {
      await this.queueImmediateNotification(notification);
    } else {
      await this.queueDigestNotification(notification, preference.digestFrequency);
    }

    return notification;
  }

  private async queueImmediateNotification(notification: Notification): Promise<void> {
    const options: any = {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    };

    if (notification.scheduledFor) {
      options.delay = notification.scheduledFor.getTime() - Date.now();
    }

    if (notification.priority > 0) {
      options.priority = notification.priority;
    }

    await this.notificationsQueue.add(
      'send',
      { notificationId: notification.id },
      options,
    );
  }

  private async queueDigestNotification(
    notification: Notification,
    frequency: DigestFrequency,
  ): Promise<void> {
    const delay = this.calculateDigestDelay(frequency);
    
    await this.notificationsQueue.add(
      'digest',
      {
        userId: notification.userId,
        frequency,
      },
      {
        delay,
        jobId: `digest:${notification.userId}:${frequency}`,
        priority: notification.priority,
      },
    );
  }

  private calculateDigestDelay(frequency: DigestFrequency): number {
    const now = new Date();
    let nextRun: Date;

    switch (frequency) {
      case DigestFrequency.HOURLY:
        nextRun = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1);
        break;
      case DigestFrequency.DAILY:
        nextRun = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      default:
        throw new Error(`Unsupported digest frequency: ${frequency}`);
    }

    return nextRun.getTime() - now.getTime();
  }

  async getNotifications(userId: string, status?: NotificationStatus): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: {
        userId,
        ...(status && { status }),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getPreferences(userId: string): Promise<NotificationPreference[]> {
    return this.preferenceRepository.find({
      where: { userId },
    });
  }
}