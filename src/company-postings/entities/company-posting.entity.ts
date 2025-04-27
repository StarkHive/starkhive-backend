import { Contract } from 'src/contract/entities/contract.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from 'typeorm';

@Entity()
export class CompanyPosting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string; // Company name

  @Column({ type: 'text' })
  description: string; // Company description

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  industry?: string; // Industry sector

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  location?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  companySize?: number;

  @OneToMany(() => Contract, (contract) => contract.companyPosting)
  contracts: Contract[];

  @Column({ type: 'tsvector', nullable: true })
  search_vector: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
