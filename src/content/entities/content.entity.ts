// src/content/entities/content.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { ContentStatus } from '../enums/content-status.enum';
import { ContentType } from '../enums/content-type.enum';
import { User } from '@src/user/entities/user.entity';

@Entity('content')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  body: string;

  @Column({
    type: 'enum',
    enum: ContentType,
    default: ContentType.POST
  })
  type: ContentType;

  @Column({
    type: 'enum',
    enum: ContentStatus,
    default: ContentStatus.PENDING
  })
  status: ContentStatus;

  @Column({ nullable: true })
  moderatedBy: string;

  @Column({ nullable: true })
  moderatedAt: Date;

  @Column({ nullable: true })
  moderationNotes: string;

  @ManyToOne(() => User, (user) => user.content, { eager: true })
  creator: User; // Reference to the User entity

  @Column()
  creatorId: string; // This should match the User ID

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}