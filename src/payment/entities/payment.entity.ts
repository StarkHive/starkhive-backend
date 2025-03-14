import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Contract } from '../../contract/entities/contract.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' }) 
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionHash: string;

  @ManyToOne(() => Contract, (contract) => contract.payments, { nullable: false, onDelete: 'CASCADE' })
  contract: Contract;

  @ManyToOne(() => User, (user) => user.payments, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}