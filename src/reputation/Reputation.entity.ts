import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@src/user/entities/user.entity';

@Entity()
export class Reputation {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.reputation, { onDelete: 'CASCADE' })
  @JoinColumn() // Required for the owner of the relation
  user: User;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  completedJobs: number;

  @Column({ type: 'boolean', default: false })
  verificationStatus: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUpdated: Date;
}
