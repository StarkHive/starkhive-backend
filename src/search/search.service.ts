import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { JobPosting } from '../job-postings/entities/job-posting.entity';
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';
import { Company } from '../company/entities/company.entity';
import { SearchJobsDto, JobSortField } from './dto/search-jobs.dto';
import { SearchFreelancersDto, FreelancerSortField } from './dto/search-freelancers.dto';
import { SearchCompaniesDto, CompanySortField } from './dto/search-companies.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(JobPosting)
    private readonly jobRepository: Repository<JobPosting>,
    @InjectRepository(FreelancerProfile)
    private readonly freelancerRepository: Repository<FreelancerProfile>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async searchJobs(searchDto: SearchJobsDto) {
    const queryBuilder = this.jobRepository.createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.skills', 'skills');

    // Full-text search on title and description
    if (searchDto.query) {
      queryBuilder.andWhere(
        '(job.title ILIKE :query OR job.description ILIKE :query)',
        { query: `%${searchDto.query}%` }
      );
    }

    // Filter by skills
    if (searchDto.skills?.length) {
      queryBuilder.andWhere('skills.name IN (:...skills)', {
        skills: searchDto.skills,
      });
    }

    // Filter by location
    if (searchDto.location) {
      queryBuilder.andWhere('job.location ILIKE :location', {
        location: `%${searchDto.location}%`,
      });
    }

    // Filter by salary range
    if (searchDto.minSalary !== undefined) {
      queryBuilder.andWhere('job.salary >= :minSalary', {
        minSalary: searchDto.minSalary,
      });
    }
    if (searchDto.maxSalary !== undefined) {
      queryBuilder.andWhere('job.salary <= :maxSalary', {
        maxSalary: searchDto.maxSalary,
      });
    }

    // Sorting
    switch (searchDto.sortBy) {
      case JobSortField.SALARY:
        queryBuilder.orderBy('job.salary', searchDto.sortOrder);
        break;
      case JobSortField.TITLE:
        queryBuilder.orderBy('job.title', searchDto.sortOrder);
        break;
      case JobSortField.RELEVANCE:
        if (searchDto.query) {
          // Implement relevance scoring based on match quality
          queryBuilder.orderBy(
            `CASE 
              WHEN job.title ILIKE :exactQuery THEN 3
              WHEN job.title ILIKE :partialQuery THEN 2
              WHEN job.description ILIKE :partialQuery THEN 1
              ELSE 0
            END`,
            'DESC'
          )
          .setParameters({
            exactQuery: searchDto.query,
            partialQuery: `%${searchDto.query}%`,
          });
        }
        break;
      default:
        queryBuilder.orderBy('job.createdAt', searchDto.sortOrder);
    }

    // Pagination
    const [items, total] = await queryBuilder
      .skip((searchDto.page - 1) * searchDto.limit)
      .take(searchDto.limit)
      .getManyAndCount();

    return {
      items,
      total,
      page: searchDto.page,
      limit: searchDto.limit,
      pages: Math.ceil(total / searchDto.limit),
    };
  }

  async searchFreelancers(searchDto: SearchFreelancersDto) {
    const queryBuilder = this.freelancerRepository.createQueryBuilder('freelancer')
      .leftJoinAndSelect('freelancer.skills', 'skills')
      .leftJoinAndSelect('freelancer.user', 'user');

    // Full-text search on name and bio
    if (searchDto.query) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :query OR user.lastName ILIKE :query OR freelancer.bio ILIKE :query)',
        { query: `%${searchDto.query}%` }
      );
    }

    // Filter by skills
    if (searchDto.skills?.length) {
      queryBuilder.andWhere('skills.name IN (:...skills)', {
        skills: searchDto.skills,
      });
    }

    // Filter by location
    if (searchDto.location) {
      queryBuilder.andWhere('freelancer.location ILIKE :location', {
        location: `%${searchDto.location}%`,
      });
    }

    // Filter by hourly rate range
    if (searchDto.minHourlyRate !== undefined) {
      queryBuilder.andWhere('freelancer.hourlyRate >= :minRate', {
        minRate: searchDto.minHourlyRate,
      });
    }
    if (searchDto.maxHourlyRate !== undefined) {
      queryBuilder.andWhere('freelancer.hourlyRate <= :maxRate', {
        maxRate: searchDto.maxHourlyRate,
      });
    }

    // Filter by experience
    if (searchDto.minExperience !== undefined) {
      queryBuilder.andWhere('freelancer.yearsOfExperience >= :minExp', {
        minExp: searchDto.minExperience,
      });
    }

    // Sorting
    switch (searchDto.sortBy) {
      case FreelancerSortField.RATING:
        queryBuilder.orderBy('freelancer.rating', searchDto.sortOrder);
        break;
      case FreelancerSortField.HOURLY_RATE:
        queryBuilder.orderBy('freelancer.hourlyRate', searchDto.sortOrder);
        break;
      case FreelancerSortField.EXPERIENCE:
        queryBuilder.orderBy('freelancer.yearsOfExperience', searchDto.sortOrder);
        break;
      case FreelancerSortField.RELEVANCE:
        if (searchDto.query) {
          queryBuilder.orderBy(
            `CASE 
              WHEN user.firstName ILIKE :exactQuery OR user.lastName ILIKE :exactQuery THEN 3
              WHEN freelancer.bio ILIKE :exactQuery THEN 2
              WHEN freelancer.bio ILIKE :partialQuery THEN 1
              ELSE 0
            END`,
            'DESC'
          )
          .setParameters({
            exactQuery: searchDto.query,
            partialQuery: `%${searchDto.query}%`,
          });
        }
        break;
    }

    // Pagination
    const [items, total] = await queryBuilder
      .skip((searchDto.page - 1) * searchDto.limit)
      .take(searchDto.limit)
      .getManyAndCount();

    return {
      items,
      total,
      page: searchDto.page,
      limit: searchDto.limit,
      pages: Math.ceil(total / searchDto.limit),
    };
  }

  async searchCompanies(searchDto: SearchCompaniesDto) {
    const queryBuilder = this.companyRepository.createQueryBuilder('company');

    // Full-text search on name and description
    if (searchDto.query) {
      queryBuilder.andWhere(
        '(company.name ILIKE :query OR company.description ILIKE :query)',
        { query: `%${searchDto.query}%` }
      );
    }

    // Filter by industry
    if (searchDto.industry) {
      queryBuilder.andWhere('company.industry ILIKE :industry', {
        industry: searchDto.industry,
      });
    }

    // Filter by location
    if (searchDto.location) {
      queryBuilder.andWhere('company.location ILIKE :location', {
        location: `%${searchDto.location}%`,
      });
    }

    // Filter by company size range
    if (searchDto.minSize !== undefined) {
      queryBuilder.andWhere('company.employeeCount >= :minSize', {
        minSize: searchDto.minSize,
      });
    }
    if (searchDto.maxSize !== undefined) {
      queryBuilder.andWhere('company.employeeCount <= :maxSize', {
        maxSize: searchDto.maxSize,
      });
    }

    // Sorting
    switch (searchDto.sortBy) {
      case CompanySortField.NAME:
        queryBuilder.orderBy('company.name', searchDto.sortOrder);
        break;
      case CompanySortField.SIZE:
        queryBuilder.orderBy('company.employeeCount', searchDto.sortOrder);
        break;
      case CompanySortField.FOUNDED:
        queryBuilder.orderBy('company.foundedYear', searchDto.sortOrder);
        break;
      case CompanySortField.RELEVANCE:
        if (searchDto.query) {
          queryBuilder.orderBy(
            `CASE 
              WHEN company.name ILIKE :exactQuery THEN 3
              WHEN company.name ILIKE :partialQuery THEN 2
              WHEN company.description ILIKE :partialQuery THEN 1
              ELSE 0
            END`,
            'DESC'
          )
          .setParameters({
            exactQuery: searchDto.query,
            partialQuery: `%${searchDto.query}%`,
          });
        }
        break;
    }

    // Pagination
    const [items, total] = await queryBuilder
      .skip((searchDto.page - 1) * searchDto.limit)
      .take(searchDto.limit)
      .getManyAndCount();

    return {
      items,
      total,
      page: searchDto.page,
      limit: searchDto.limit,
      pages: Math.ceil(total / searchDto.limit),
    };
  }
}
