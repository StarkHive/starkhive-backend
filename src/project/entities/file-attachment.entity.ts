import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { Task } from './task.entity';
import { Deliverable } from './deliverable.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('file_attachments')
export class FileAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 255 })
  originalFileName: string;

  @Column({ type: 'varchar', length: 255 })
  mimeType: string;

  @Column({ type: 'varchar', length: 255 })
  path: string;

  @Column({ type: 'int' })
  size: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Project, (project) => project.files, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @ManyToOne(() => Task, (task) => task.files, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'task_id', nullable: true })
  taskId: string;

  @ManyToOne(() => Deliverable, (deliverable) => deliverable.files, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'deliverable_id' })
  deliverable: Deliverable;

  @Column({ name: 'deliverable_id', nullable: true })
  deliverableId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;

  @Column({ name: 'uploaded_by' })
  uploadedById: string;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 