
// 8. Create Report Entity (src/reporting/entities/report.entity.ts)
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ReportType } from '../enums/report-type.enum';
import { User } from '@src/user/entities/user.entity';
import { ReportStatus } from '../enums/report-status.enums';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ReportType
  })
  type: ReportType;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING
  })
  status: ReportStatus;

  @Column()
  resourceType: string;

  @Column()
  resourceId: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @Column()
  reporterId: string;

  @Column({ nullable: true })
  reviewerId: string;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  reviewNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}