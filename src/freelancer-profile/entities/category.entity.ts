import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FreelancerPortfolioProject } from './freelancer-portfolio.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => FreelancerPortfolioProject, (project) => project.category)
  projects: FreelancerPortfolioProject[];
}
