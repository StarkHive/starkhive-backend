import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Policy } from '../policy/policy.entity';
import { User } from '../user/entities/user.entity';

export enum ViolationStatus {
  DETECTED = 'detected',
  REVIEWING = 'reviewing',
  CONFIRMED = 'confirmed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum ViolationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('policy_violations')
export class PolicyViolation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Policy, (policy) => policy.violations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'policyId' })
  policy: Policy;

  @Column()
  policyId: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  evidence: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ViolationStatus,
    default: ViolationStatus.DETECTED,
  })
  status: ViolationStatus;

  @Column({
    type: 'enum',
    enum: ViolationSeverity,
    default: ViolationSeverity.MEDIUM,
  })
  severity: ViolationSeverity;

  @Column({ type: 'boolean', default: false })
  autoEnforced: boolean;

  @Column({ type: 'jsonb', nullable: true })
  enforcementActions: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn()
  detectedAt: Date;
}
