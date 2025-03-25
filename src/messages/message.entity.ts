import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('text')
  content: string;

  @Column()
  senderId: string;

  @Column()
  receiverId: string; // Added

  @Column()
  roomId: string;

  @Column()
  status: string; // Added (e.g., 'sent', 'delivered', 'read')

  @Column()
  timestamp: Date; // Added

  @CreateDateColumn()
  createdAt: Date;
}