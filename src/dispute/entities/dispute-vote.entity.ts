import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Dispute } from './dispute.entity';

export enum VoteDecision {
  UPHOLD = 'uphold',
  REJECT = 'reject',
  ABSTAIN = 'abstain'
}

@Entity('dispute_votes')
export class DisputeVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Dispute, dispute => dispute.votes)
  @JoinColumn({ name: 'dispute_id' })
  dispute: Dispute;

  @Column({ name: 'dispute_id' })
  disputeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'juror_id' })
  juror: User;

  @Column({ name: 'juror_id' })
  jurorId: string;

  @Column({ type: 'enum', enum: VoteDecision })
  decision: VoteDecision;

  @Column({ type: 'text', nullable: true })
  reasoning: string;

  @CreateDateColumn()
  createdAt: Date;
} 