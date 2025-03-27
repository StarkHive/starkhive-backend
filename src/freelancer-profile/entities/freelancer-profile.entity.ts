import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsUrl,
  IsNumber,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Project } from '@src/project/entities/project.entity';
import { FreelancerPortfolioProject } from './freelancer-portfolio.entity';

export enum ExperienceLevel {
  ENTRY = 'entry',
  INTERMEDIATE = 'intermediate',
  EXPERT = 'expert',
}

@Entity('freelancer_profiles')
export class FreelancerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.freelancerProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column('text', { array: true, default: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills: string[];

  @Column('text')
  @IsNotEmpty()
  @IsString()
  experience: string;

  @Index()
  @Column({
    type: 'enum',
    enum: ExperienceLevel,
    default: ExperienceLevel.ENTRY
  })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @Index()
  @Column('text', { nullable: true })
  @IsString()
  @IsOptional()
  location: string;

  @Index()
  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @Column('text', { array: true, default: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages: string[];

  @Column('text', { array: true, default: [] })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  portfolioLinks: string[];

  @Index()
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  @IsNumber()
  @IsOptional()
  hourlyRate: number;

  @OneToMany(
    () => FreelancerPortfolioProject,
    (portfolioProject) => portfolioProject.profile,
  )
  portfolioProjects: FreelancerPortfolioProject[];

  @OneToMany(() => Project, (project) => project.freelancer)
  projects: Project[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
