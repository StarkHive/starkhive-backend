import { IsArray } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Testimonial } from './testimonial.entity';
import { FreelancerProfile } from './freelancer-profile.entity';

export enum ProjectVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  LIMITED = 'limited',
}

@Entity('freelancer_portfolio_project')
export class FreelancerPortfolioProject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profileId: string;

  @Column()
  projectDescription: string;

  @ManyToOne(() => FreelancerProfile, (profile) => profile.portfolioProjects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: FreelancerProfile;

  @Column('bytea', { array: true, default: [] })
  @IsArray()
  mediaBuffer: Buffer;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({
    type: 'enum',
    enum: ProjectVisibility,
    default: ProjectVisibility.PUBLIC,
  })
  visibility: ProjectVisibility;

  @Column({ type: 'jsonb', nullable: true })
  testimonials: Testimonial[];

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastViewedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => FreelancerProfile, (profile) => profile.portfolioProjects)
  freelancerProfile: FreelancerProfile;
}
