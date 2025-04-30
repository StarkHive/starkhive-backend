import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { EscrowPaymentSplit } from './escrow-payment-split.entity';

@Entity('escrow_payment_audit_logs')
export class EscrowPaymentAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EscrowPaymentSplit, (split: EscrowPaymentSplit) => split.auditLogs, { onDelete: 'CASCADE' })
  split: EscrowPaymentSplit;

  @Column()
  action: string;

  @Column('jsonb', { nullable: true })
  details: any;

  @CreateDateColumn()
  timestamp: Date;
}
