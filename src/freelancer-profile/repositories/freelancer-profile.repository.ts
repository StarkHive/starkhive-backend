import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FreelancerProfile } from '../entities/freelancer-profile.entity';
import { CreateFreelancerProfileDto } from '../dto/create-freelancer-profile.dto';
import { SearchFreelancerProfileDto, SortBy, SortOrder } from '../dto/search-freelancer-profile.dto';

@Injectable()
export class FreelancerProfileRepository {
  constructor(
    @InjectRepository(FreelancerProfile)
    private readonly repository: Repository<FreelancerProfile>,
  ) {}

  async createFreelancerProfile(
    createFreelancerProfileDto: CreateFreelancerProfileDto,
  ) {
    const profile = this.repository.create(createFreelancerProfileDto);
    return this.repository.save(profile);
  }

  async findAll() {
    return this.repository.find();
  }

  async findProfileByUserId(userId: string) {
    return this.repository.findOne({ where: { user: { id: userId } } });
  }

  async updateSkills(id: string, skills: string[]) {
    return this.repository.update(id, { skills });
  }

  async updateExperience(id: string, experience: string) {
    return this.repository.update(id, { experience });
  }

  async deleteProfile(id: string) {
    return this.repository.delete(id);
  }

  async searchProfiles(searchParams: SearchFreelancerProfileDto) {
    const {
      skills,
      experienceLevel,
      location,
      minRating,
      languages,
      minHourlyRate,
      maxHourlyRate,
      sortBy = SortBy.RATING,
      sortOrder = SortOrder.DESC,
      page = 1,
      limit = 10,
    } = searchParams;

    const queryBuilder = this.repository.createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('profile.portfolioProjects', 'portfolioProjects');

    // Apply filters
    if (skills && skills.length > 0) {
      queryBuilder.andWhere('profile.skills @> ARRAY[:...skills]', { skills });
    }

    if (experienceLevel) {
      queryBuilder.andWhere('profile.experienceLevel = :experienceLevel', { experienceLevel });
    }

    if (location) {
      queryBuilder.andWhere('LOWER(profile.location) LIKE LOWER(:location)', {
        location: `%${location}%`,
      });
    }

    if (minRating) {
      queryBuilder.andWhere('profile.rating >= :minRating', { minRating });
    }

    if (languages && languages.length > 0) {
      queryBuilder.andWhere('profile.languages @> ARRAY[:...languages]', { languages });
    }

    if (minHourlyRate) {
      queryBuilder.andWhere('profile.hourlyRate >= :minHourlyRate', { minHourlyRate });
    }

    if (maxHourlyRate) {
      queryBuilder.andWhere('profile.hourlyRate <= :maxHourlyRate', { maxHourlyRate });
    }

    // Apply sorting
    queryBuilder.orderBy(`profile.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Get results and total count
    const [profiles, total] = await queryBuilder.getManyAndCount();

    return {
      data: profiles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
