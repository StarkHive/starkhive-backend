import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { JobTag } from './job-tag.entity';
import { User } from '@src/user/entities/user.entity';
import { VoteType } from '../enums/voteType.enum';

@Entity()
@Unique(['userId', 'tagId'])
export class TagVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: VoteType,
  })
  voteType: VoteType;

  @ManyToOne(() => JobTag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  @Index()
  tag: JobTag;

  @Column({ name: 'tag_id' })
  tagId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
