import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum ProofOfWorkStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('proof_of_work')
export class ProofOfWork {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  jobId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'freelancer_id' })
  freelancer: User;

  @Column({ type: 'uuid', name: 'freelancer_id' })
  freelancerId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  links: string[];

  @Column({ type: 'jsonb', nullable: true })
  files: {
    filename: string;
    path: string;
    mimeType: string;
  }[];

  @Column({
    type: 'enum',
    enum: ProofOfWorkStatus,
    default: ProofOfWorkStatus.PENDING,
  })
  status: ProofOfWorkStatus;

  @Column({ type: 'text', nullable: true })
  clientFeedback: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
