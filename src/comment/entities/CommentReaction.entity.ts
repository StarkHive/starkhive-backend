@Entity()
export class CommentReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Comment, (comment) => comment.reactions, { onDelete: 'CASCADE' })
  comment: Comment;

  @Column()
  userId: string;
  
  @Column()
  reactionType: string;

  @CreateDateColumn()
  createdAt: Date;
}
