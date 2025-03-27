import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FreelancerPortfolioProject } from "./freelancer-portfolio.entity";

@Entity()
export class ProjectMedia {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Assumption made that media will be saved to some s3 bucket
    @Column()
    url: string;

    @Column()
    mimeType: string;

    @ManyToOne(() => FreelancerPortfolioProject)
    project: FreelancerPortfolioProject
}