import { TransactionLog } from '@src/payment/entities/transaction-log.entity';
import { User } from '@src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';


export enum AppealStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class ReputationAppeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => TransactionLog)
  transaction: TransactionLog;

  @Column('text')
  reason: string;

  @Column({ type: 'enum', enum: AppealStatus, default: AppealStatus.PENDING })
  status: AppealStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  reviewedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date;
}
