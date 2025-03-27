import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { Comment } from './comment.entity';

@Entity()
export class CommentReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Comment, (comment: Comment) => comment.reactions, { onDelete: 'CASCADE' })
  comment: Comment;

  @Column()
  userId: string;
  
  @Column()
  reactionType: string;

  @CreateDateColumn()
  createdAt: Date;
}
