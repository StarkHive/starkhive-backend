import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
  } from 'typeorm';
  
  @Entity()
  export class InterviewSlot {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    @Index()
    userId: string;
  
    @Column()
    @Index()
    recruiterId: string;
  
    @Column()
    title: string;
  
    @Column({ type: 'text' })
    description: string;
  
    @Column({ type: 'timestamptz' })
    @Index()
    startTime: Date;
  
    @Column({ type: 'timestamptz' })
    endTime: Date;
  
    @Column()
    timezone: string;
  
    @Column({ nullable: true })
    location?: string;
  
    @Column('text', { array: true, nullable: true })
    participants?: string[];
  
    @Column({ default: 'proposed' })
    status: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }