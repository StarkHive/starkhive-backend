import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Project } from './project.entity';
import { User } from 'src/user/entities/user.entity';
import { FileAttachment } from './file-attachment.entity';
import { TimeLog } from './time-log.entity';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'int', default: 0 })
  estimatedHours: number;

  @ManyToOne(() => Project, (project) => project.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'task_assignees',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  assignees: User[];

  @ManyToOne(() => Task, (task) => task.subtasks, { nullable: true })
  @JoinColumn({ name: 'parent_task_id' })
  parentTask: Task;

  @Column({ name: 'parent_task_id', nullable: true })
  parentTaskId: string;

  @OneToMany(() => Task, (task) => task.parentTask)
  subtasks: Task[];

  @OneToMany(() => FileAttachment, (file) => file.task, {
    cascade: true,
  })
  files: FileAttachment[];

  @OneToMany(() => TimeLog, (timeLog) => timeLog.task, {
    cascade: true,
  })
  timeLogs: TimeLog[];

  @Column({ type: 'decimal', default: 0 })
  completionPercentage: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'date', nullable: true })
  completedAt: Date;
} 