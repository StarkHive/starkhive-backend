import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FreelancerPortfolioProject } from "../entities/freelancer-portfolio.entity";
import { Repository } from "typeorm";
import { CreatePortfolioProjectDto } from "../dto/create-portfolio-project.dto";

@Injectable()
export class FreelancerPortfolioRepository {
    constructor(
        @InjectRepository(FreelancerPortfolioProject)
        private readonly freelancePortfolioRepository: Repository<FreelancerPortfolioProject>
    ) {}

    async createPortfolioProject(payload: CreatePortfolioProjectDto): Promise<FreelancerPortfolioProject> {
        const freelancerPortfolioProject = this.freelancePortfolioRepository.create(payload);
        return this.freelancePortfolioRepository.save(freelancerPortfolioProject)
    }

    async findById(id: string): Promise<FreelancerPortfolioProject | null> {
        return this.freelancePortfolioRepository.findOne({
            where: { id }
        })
    }

    async findProjects(filter: {
        category?: string,
        tags?: string[],
        userId?: string,
        sortBy: 'recent' | 'popular'
    }) : Promise<FreelancerPortfolioProject[]> {

        const query = this.freelancePortfolioRepository.createQueryBuilder('project').leftJoinAndSelect('project.category', 'category');

        if (filter.category) {
            query.andWhere('category.name = :category', { category: filter.category });
        }

        if (filter.tags?.length) {
            query.andWhere('project.tags && :tags', { tags: filter.tags })
        }

        if (filter.userId) {
            query.andWhere('project.userId = :userId', { userId: filter.userId })
        }

        if (filter.sortBy === 'recent') {
            query.addOrderBy('project.createdAt', 'DESC');
        }

        if (filter.sortBy === 'popular') {
            query.addOrderBy('project.views', 'DESC')
        }

        return query.getMany()
    }

    async incrementViews(id: string): Promise<void> {
        await this.freelancePortfolioRepository
            .createQueryBuilder()
            .update(FreelancerPortfolioProject)
            .set({ views: () => "views + 1" })
            .set({ lastViewedAt: () => "Date.now" })
            .where("id = :id", { id })
            .execute()
    }
}