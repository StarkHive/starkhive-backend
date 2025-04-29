import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { DisputeVote } from './dispute-vote.entity';

export enum DisputeStatus {
  PENDING = 'pending',
  JUROR_ASSIGNMENT = 'juror_assignment',
  VOTING = 'voting',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated'
}

export enum DisputeOutcome {
  PENDING = 'pending',
  UPHELD = 'upheld',
  REJECTED = 'rejected',
  TIED = 'tied',
  ESCALATED = 'escalated'
}

@Entity('disputes')
export class Dispute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', array: true, default: '{}' })
  evidenceUrls: string[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ name: 'creator_id' })
  creatorId: string;

  @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.PENDING })
  status: DisputeStatus;

  @Column({ type: 'enum', enum: DisputeOutcome, default: DisputeOutcome.PENDING })
  outcome: DisputeOutcome;

  @Column('uuid', { array: true, default: '{}' })
  assignedJurorIds: string[];

  @Column({ type: 'timestamp', nullable: true })
  votingDeadline: Date;

  @OneToMany(() => DisputeVote, vote => vote.dispute)
  votes: DisputeVote[];

  @Column({ type: 'text', nullable: true })
  resolutionSummary: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 