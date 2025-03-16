import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  walletAddress: string;

  @Column({ default: 0 })
  reputationScore: number;

  @Column({ default: 'ETH' })
  paymentPreference: string;

  @Column('text', { array: true, default: [] })
  skills: string[];

  @Column('text', { array: true, default: [] })
  workHistory: string[];

  @Column({ default: true })
  isActive: boolean;
}
