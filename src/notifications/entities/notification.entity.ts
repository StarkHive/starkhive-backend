import { User } from '@src/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

export enum NotificationType {
  JOB_MATCH = 'job_match',
  MESSAGE = 'message',
  ENDORSEMENT = 'endorsement',
  GENERAL = "general",
  MENTION = "mention",
  DISPUTE_ASSIGNMENT = 'DISPUTE_ASSIGNMENT',
  DISPUTE_RESOLUTION = 'DISPUTE_RESOLUTION',
  REQUEST_DECLINED = 'request_declined',
  REQUEST_ACCEPTED = 'request_accepted',
  REQUEST_COMPLETED = 'request_completed',
  JOB_POSTED = "job_posted",
  JOB_UPDATED = "job_updated",
  JOB_DELETED = "job_deleted",
  NEW_JOB_POSTING = "new_job_posting",
  JOB_POSTING_UPDATED = "job_posting_updated",
  JOB_POSTING_REMOVED = "job_posting_removed",
  RECOMMENDATION_APPROVED = "recommendation_approved",
  RECOMMENDATION_REJECTED = "recommendation_rejected",
  NEW_RECOMMENDATION = "new_recommendation",
  REPORT_UPDATE = "report_update",
  
}

export enum DeliveryChannel {
  EMAIL = 'email',
  WEBHOOK = 'webhook',
  PUSH = 'push',
}

export enum NotificationStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  SCHEDULED = 'scheduled',
}

export enum DigestFrequency {
  IMMEDIATE = 'immediate',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column('json')
  content: Record<string, any>;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({
    type: 'enum',
    enum: DeliveryChannel,
  })
  deliveryChannel: DeliveryChannel;

  @Column({ default: false })
  read: boolean;


  @Column({ nullable: true })
  scheduledFor: Date;

  @Column({ default: 0 })
  priority: number;

  @Column({ default: 0 })
  retryCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 