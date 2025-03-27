import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Project } from './project.entity';
import { Milestone } from './milestone.entity';
import { FileAttachment } from './file-attachment.entity';

export enum DeliverableStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('deliverables')
export class Deliverable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DeliverableStatus,
    default: DeliverableStatus.PENDING,
  })
  status: DeliverableStatus;

  @Column({ type: 'date' })
  dueDate: Date;

  @ManyToOne(() => Project, (project) => project.deliverables, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Milestone, (milestone) => milestone.deliverables, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'milestone_id' })
  milestone: Milestone;

  @Column({ name: 'milestone_id', nullable: true })
  milestoneId: string;

  @OneToMany(() => FileAttachment, (file) => file.deliverable, {
    cascade: true,
  })
  files: FileAttachment[];

  @Column({ type: 'text', nullable: true })
  clientFeedback: string;

  @Column({ type: 'date', nullable: true })
  submittedAt: Date;

  @Column({ type: 'date', nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 