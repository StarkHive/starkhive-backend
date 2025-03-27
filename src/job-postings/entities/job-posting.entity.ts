
import { Contract } from 'src/contract/entities/contract.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from 'typeorm';

@Entity()
export class JobPosting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @Index() // Creates an index to speed up LIKE searches
  title: string;

  @Column({ type: 'text' })
  @Index({ fulltext: true }) // Enables full-text search for the description field
  description: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  company: string;

  @Column({ type: 'decimal', nullable: true })
  @Index()
  salary?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) 
  employmentType?: string; // Full-time, Part-time, Contract, Remote, etc.

  @Column({ type: 'varchar', length: 255, nullable: true })
  experienceLevel?: string; // Entry-Level, Mid, Senior, etc.

  @OneToMany(() => Contract, (contract) => contract.jobPosting)
  contracts: Contract[];

  @Column({ type: 'tsvector', nullable: true })
  search_vector: string; // Stores the full-text search vector

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

