import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('error_logs')
export class ErrorLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column()
  @Index()
  errorCode: string;

  @Column({
    type: 'enum',
    enum: ErrorSeverity,
    default: ErrorSeverity.MEDIUM,
  })
  @Index()
  severity: ErrorSeverity;

  @Column({ nullable: true })
  stackTrace: string;

  @Column({ nullable: true })
  userId: string;

  @Column()
  @Index()
  path: string;

  @Column()
  method: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
