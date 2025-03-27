import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('engagement_metrics')
export class EngagementMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('int')
  playCount: number;

  @Column('int', { nullable: true })
  sessionDuration: number; // in seconds

  @Column('int', { nullable: true })
  skips: number;

  @CreateDateColumn()
  createdAt: Date;
}
