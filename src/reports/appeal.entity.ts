// src/reports/entities/appeal.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Report } from './report.entity';
import { User } from '@src/user/entities/user.entity';

@Entity()
export class Appeal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Report, { nullable: false })
  report: Report;

  @ManyToOne(() => User, { nullable: false })
  appellant: User;

  @Column()
  reason: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}