import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { NotificationType, DeliveryChannel, DigestFrequency } from './notification.entity';
import { User } from '@src/user/entities/user.entity';

@Entity('notification_preferences')
export class NotificationPreference {
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
  notificationType: NotificationType;

  @Column({
    type: 'enum',
    enum: DeliveryChannel,
    array: true,
    default: [DeliveryChannel.EMAIL],
  })
  deliveryChannels: DeliveryChannel[];

  @Column({
    type: 'enum',
    enum: DigestFrequency,
    default: DigestFrequency.IMMEDIATE,
  })
  digestFrequency: DigestFrequency;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'json', nullable: true })
  channelConfig: {
    webhook?: {
      url: string;
      headers?: Record<string, string>;
    };
    email?: {
      address: string;
    };
    push?: {
      deviceTokens: string[];
    };
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 