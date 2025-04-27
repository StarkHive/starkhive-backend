import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FreelancerPortfolioProject } from "./freelancer-portfolio.entity";

@Entity()
export class Testimonial {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    clientName: string;

    @Column()
    ClientTestimony: string;

    @ManyToOne(() => FreelancerPortfolioProject)
    project: FreelancerPortfolioProject;
}