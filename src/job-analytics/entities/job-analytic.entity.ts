import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { JobPosting } from '../../job-postings/entities/job-posting.entity';

export enum AnalyticsEventType {
  VIEW = 'view',
  APPLICATION = 'application',
  CLICK = 'click',
  SHARE = 'share',
  BOOKMARK = 'bookmark',
}

@Entity() 
export class JobAnalytic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  jobPostingId: number; // Integer for job ID

  @ManyToOne(() => JobPosting, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobPostingId' })
  jobPosting: JobPosting;

  @Column({
    type: 'enum',
    enum: AnalyticsEventType,
    default: AnalyticsEventType.VIEW,
  })
  @Index()
  eventType: AnalyticsEventType;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', nullable: true })
  referrer: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}