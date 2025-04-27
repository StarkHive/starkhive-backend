import { Injectable } from "@nestjs/common";
import { FreelancerPortfolioRepository } from "./repositories/freelancer-portfolio.repository";
import { FreelancerPortfolioProject } from "./entities/freelancer-portfolio.entity";

@Injectable()
export class FreelancerPortfolioService {
    constructor(private readonly freelancerPortfolioRepository: FreelancerPortfolioRepository){}

    async findProjects(filter: {
        category?: string,
        tags?: string[],
        userId?: string,
        sortBy: 'recent' | 'popular'
    }): Promise<FreelancerPortfolioProject[]>{
        return this.freelancerPortfolioRepository.findProjects(filter)
    }

    async incrementViews(projectId: string){
        await this.freelancerPortfolioRepository.incrementViews(projectId)
    }
}