import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  JOB_MATCH = 'job_match',
  MESSAGE = 'message',
  ENDORSEMENT = 'endorsement',
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