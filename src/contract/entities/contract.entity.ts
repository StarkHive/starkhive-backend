import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { JobPosting } from '../../job-postings/entities/job-posting.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { CompanyPosting } from 'src/company-postings/entities/company-posting.entity';
import { Project } from '../../project/entities/project.entity';

@Entity()
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  terms: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'boolean', default: false })
  isCompleted: boolean;

  @Column({ type: 'varchar', length: 255 })
  status: string;

  @ManyToOne(
    () => CompanyPosting,
    (companyPosting) => companyPosting.contracts,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  companyPosting: CompanyPosting;

  @ManyToOne(() => User, (user) => user.contracts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => JobPosting, (jobPosting) => jobPosting.contracts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  jobPosting: JobPosting;

  @OneToMany(() => Payment, (payment) => payment.contract)
  payments: Payment[];

  @OneToMany(() => Project, (project) => project.contract)
  projects: Project[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}