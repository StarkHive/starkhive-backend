import { Entity, 
        PrimaryGeneratedColumn, 
        Column, ManyToOne, 
        CreateDateColumn, 
        UpdateDateColumn } from 'typeorm';
import { User } from '@src/user/entities/user.entity';

@Entity()
export class Reputation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.reputation, { onDelete: 'CASCADE' })
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
