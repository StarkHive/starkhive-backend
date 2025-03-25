
import { User } from '@src/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  reporter: User; // The user who submitted the report

  @ManyToOne(() => User, { nullable: true })
  reportedUser: User; // The user being reported (if applicable)

  @Column({ nullable: true })
  contentId: number; // ID of the content being reported (e.g., a post)

  @Column()
  category: string; // e.g., 'inappropriate', 'fraud', 'policy_violation'

  @Column()
  reason: string; // Specific reason for the report

  @Column({ default: 'pending' })
  status: string; // e.g., 'pending', 'under_review', 'resolved', 'dismissed'

  @Column({ nullable: true })
  moderatorNotes: string; // Notes from the moderator

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}