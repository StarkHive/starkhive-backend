/* eslint-disable @typescript-eslint/no-require-imports */
import { Injectable, NotFoundException, Inject, forwardRef, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager, FindOptionsWhere } from "typeorm";
import * as nodemailer from "nodemailer";
import { NotificationSettingsService } from "../notification-settings/notification-settings.service";
import { JobNotification } from "./entities/job-notification.entities";
import { SseService } from "../sse/sse.service";
import { NotificationEventDto } from "./dto/notification-event.dto";
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Notification, NotificationStatus, DigestFrequency, NotificationType, DeliveryChannel } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { UpdateNotificationPreferenceDto } from './dto/notification-preference.dto';
import { TriggerNotificationDto } from './dto/trigger-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: "your-email@gmail.com", pass: "your-password" },
  });

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

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    content: Record<string, any>;
    deliveryChannel?: DeliveryChannel;
    priority?: number;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId: data.userId,
      type: data.type,
      content: data.content,
      status: NotificationStatus.PENDING,
      deliveryChannel: data.deliveryChannel ?? DeliveryChannel.PUSH,
      read: false,
      priority: data.priority ?? 0,
      retryCount: 0,
    });

    return this.notificationRepository.save(notification);
  }

  async createMessageNotification(
    userId: string,
    message: string,
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.MESSAGE,
      content: { message },
      deliveryChannel: DeliveryChannel.PUSH,
      priority: 0,
    });
  }

  public async findByUser(userId: string): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  public async markAsRead(id: string, read: boolean) {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    notification.read = read;
    const updated = await this.notificationRepository.save(notification);

    // Also update the SSE clients about this change
    this.emitSseNotification(
      "notification_status_changed",
      {
        id: notification.id,
        read: notification.read,
      },
      Number(notification.userId),
    );

    return updated;
  }

  public async sendEmail(to: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: "your-email@gmail.com",
      to,
      subject,
      text,
    });
  }

  private sendPushNotification(userId: number, message: string) {
    console.log(`Sending Push Notification to User ${userId}: ${message}`);
  }

  private emitSseNotification(type: string, data: any, userId?: number) {
    try {
      const event = new NotificationEventDto({
        type,
        message: data.message || "",
        data,
        userId,
      });

      this.sseService.emit({
        type,
        data,
        userId,
      });

      this.logger.debug(`Emitted SSE notification of type ${type} for user ${userId ?? "broadcast"}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Failed to emit SSE notification: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Failed to emit SSE notification: Unknown error`, String(error));
      }
    }
  }

  public async broadcastNotification(
    type: NotificationType,
    message: string,
    data?: any,
  ) {
    const notification = this.notificationRepository.create({
      userId: '0', // special ID for broadcast as string
      type, // make sure this is a valid NotificationType enum value
      content: {
        message,
        ...data,
      },
      status: NotificationStatus.PENDING,
      deliveryChannel: DeliveryChannel.PUSH,
      read: false,
      priority: 0,
      retryCount: 0,
    });
  
    await this.notificationRepository.save(notification);
  
    this.emitSseNotification(type, {
      id: notification.id,
      message,
      type,
      createdAt: notification.createdAt,
      ...data,
    });
  
    return notification;
  }

  public async sendNotification(params: {
    userId: string,
    type: NotificationType,
    message: string,
    data?: any,
    deliveryChannel?: DeliveryChannel,
  }) {
    const notification = this.notificationRepository.create({
      userId: params.userId,
      type: params.type,
      content: {
        message: params.message,
        ...params.data,
      },
      status: NotificationStatus.PENDING,
      deliveryChannel: params.deliveryChannel ?? DeliveryChannel.PUSH,
      read: false,
      priority: 0,
      retryCount: 0,
    });

    await this.notificationRepository.save(notification);

    this.emitSseNotification(params.type, {
      id: notification.id,
      message: params.message,
      type: params.type,
      createdAt: notification.createdAt,
      ...params.data,
    });

    return notification;
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

  async triggerNotification(dto: TriggerNotificationDto): Promise<Notification | null> {
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
    let delay = 0;
    switch (frequency) {
      case DigestFrequency.HOURLY:
        delay = 60 * 60 * 1000 - (now.getMinutes() * 60 + now.getSeconds()) * 1000;
        break;
      case DigestFrequency.DAILY:
        delay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
        break;
      case DigestFrequency.WEEKLY:
        const daysUntilNextWeek = (7 - now.getDay()) || 7;
        delay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilNextWeek).getTime() - now.getTime();
        break;
      default:
        delay = 0;
    }
    return delay;
  }


public async getNotifications(userId: string, status?: NotificationStatus): Promise<Notification[]> {
  const where: FindOptionsWhere<Notification> = { userId };
  if (status) {
    where.status = status;
  }
  return this.notificationRepository.find({
    where,
    order: { createdAt: "DESC" },
  });
}

public async getPreferences(userId: string): Promise<NotificationPreference[]> {
  return this.preferenceRepository.find({
    where: { userId },
  });
}

}
