import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { EscrowPayment } from './escrow-payment.entity';
import { EscrowPaymentAuditLog } from './escrow-payment-audit-log.entity';

@Entity('escrow_payment_splits')
export class EscrowPaymentSplit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EscrowPayment, (payment: EscrowPayment) => payment.splits, { onDelete: 'CASCADE' })
  escrowPayment: EscrowPayment;

  @Column({ nullable: true })
  milestoneId: string;

  @Column({ nullable: true })
  recipientId: string;

  @Column('decimal', { precision: 5, scale: 2 })
  percentage: number;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['pending', 'partial', 'completed'], default: 'pending' })
  status: 'pending' | 'partial' | 'completed';

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => EscrowPaymentAuditLog, (log: EscrowPaymentAuditLog) => log.split, { cascade: true })
  auditLogs: EscrowPaymentAuditLog[];
}
