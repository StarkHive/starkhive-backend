import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
  } from 'typeorm';
  import { JobPosting } from 'src/job-postings/entities/job-posting.entity';
  
  export enum RecruiterMetric {
    VIEW    = 'view',
    APPLY   = 'apply',
    RESPOND = 'respond',
    TTH     = 'time_to_hire',
  }
  
  @Entity('recruiter_analytics')
  export class AnalyticsEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    jobId: number;
  
    @ManyToOne(() => JobPosting, { eager: true })
    @JoinColumn({ name: 'jobId' })
    job: JobPosting;
  
    @Column({ type: 'enum', enum: RecruiterMetric })
    metricType: RecruiterMetric;
  
    @Column({ default: 1 })
    count: number;
  
    @Column({ nullable: true })
    location?: string;
  
    @Column({ type: 'jsonb', nullable: true })
    additionalData?: Record<string, any>;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  