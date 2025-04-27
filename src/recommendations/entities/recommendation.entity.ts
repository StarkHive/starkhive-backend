import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@src/user/entities/user.entity';
import { RecommendationStatus } from '../enums/RecommendationStatus.enum';

@Entity('recommendations')
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  author: User;

  @ManyToOne(() => User, { eager: true })
  recipient: User;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: RecommendationStatus,
    default: RecommendationStatus.PENDING,
  })
  status: RecommendationStatus;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ type: 'jsonb', nullable: true })
  richContent: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
