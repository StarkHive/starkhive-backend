import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  industry: string;

  @Column()
  location: string;

  @Column({ name: 'employee_count' })
  employeeCount: number;

  @Column({ name: 'founded_year' })
  foundedYear: number;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  logo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
