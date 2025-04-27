import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class PlayerEngagement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  playerId: string;

  @Column('float')
  engagementScore: number;

  @Column({ nullable: true })
  activityType: string;

  @CreateDateColumn()
  createdAt: Date;
}
