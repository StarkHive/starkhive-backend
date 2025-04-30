import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EscrowPaymentSplit } from './escrow-payment-split.entity';

@Entity('escrow_payments')
export class EscrowPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @Column('decimal', { precision: 18, scale: 2 })
  totalAmount: number;

  @Column({ type: 'enum', enum: ['milestone', 'participant'] })
  splitType: 'milestone' | 'participant';

  @OneToMany(() => EscrowPaymentSplit, split => split.escrowPayment, { cascade: true })
  splits: EscrowPaymentSplit[];

  @Column({ type: 'enum', enum: ['pending', 'partial', 'completed'], default: 'pending' })
  status: 'pending' | 'partial' | 'completed';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
