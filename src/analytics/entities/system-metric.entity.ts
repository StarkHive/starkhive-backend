import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { MetricType } from '../enums/metric-types.enum';


@Entity('system_metrics')
export class SystemMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MetricType
  })
  type: MetricType;

  @Column('float')
  value: number;

  @Column({ nullable: true })
  resourceType: string;

  @Column({ nullable: true })
  resourceId: string;

  @Column('jsonb', { nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;
}
