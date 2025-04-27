import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { FreelancerProfile } from '../../freelancer-profile/entities/freelancer-profile.entity';
import { Recruiter } from '@src/recruiter/entities/recruiter.entity';

@Entity('watchlist')
export class Watchlist {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Recruiter, (recruiter) => recruiter.watchlists)
  recruiter: Recruiter;

  @ManyToOne(() => FreelancerProfile, (freelancer) => freelancer.watchlists)
  freelancer: FreelancerProfile;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: true })
  isActive: boolean; 
}
