import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class UserProgression {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('int')
  level: number;

  @Column('float')
  progress: number;

  @CreateDateColumn()
  createdAt: Date;
}
