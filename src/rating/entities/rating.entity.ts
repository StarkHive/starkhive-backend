import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  ratingValue: number;

  @Column()
  projectId: string;

  @Column()
  description: string;

  @Column({ type: 'timestamp' })
  date: Date;
}
