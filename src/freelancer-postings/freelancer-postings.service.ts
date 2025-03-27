import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  ILike,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { FreelancerPosting } from './entities/freelancer-posting.entity';
import { CreateFreelancerDto } from './dto/create-freelancer.dto';
import { UpdateFreelancerDto } from './dto/update-freelancer.dto';

@Injectable()
export class FreelancerPostingsService {
  constructor(
    @InjectRepository(FreelancerPosting)
    private readonly freelancerRepository: Repository<FreelancerPosting>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    name?: string,
    location?: string,
    skills?: string,
    availability?: string,
    minExperience?: number,
    maxExperience?: number,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
  ) {
    const where: any = {};

    if (name) where.name = ILike(`%${name}%`);
    if (location) where.location = ILike(`%${location}%`);
    if (skills) where.skills = ILike(`%${skills}%`);
    if (availability) where.availability = ILike(`%${availability}%`);
    if (minExperience !== undefined && maxExperience !== undefined) {
      where.yearsOfExperience = Between(minExperience, maxExperience);
    } else if (minExperience !== undefined) {
      where.yearsOfExperience = MoreThanOrEqual(minExperience);
    } else if (maxExperience !== undefined) {
      where.yearsOfExperience = LessThanOrEqual(maxExperience);
    }

    const validSortFields: Record<string, string> = {
      relevance: 'search_vector',
      date: 'createdAt',
      experience: 'yearsOfExperience',
    };

    // Validate the sortBy parameter
    const orderByField =
      validSortFields[sortBy as keyof typeof validSortFields] || 'createdAt';
    const order = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [freelancers, total] = await this.freelancerRepository.findAndCount({
      where,
      order: { [orderByField]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { total, page, limit, sortBy, sortOrder, freelancers };
  }

  async findOne(id: number) {
    const freelancer = await this.freelancerRepository.findOne({
      where: { id },
    });
    if (!freelancer) {
      throw new HttpException('Freelancer not found', HttpStatus.NOT_FOUND);
    }
    return freelancer;
  }

  async create(createFreelancerDto: CreateFreelancerDto) {
    const newFreelancer = this.freelancerRepository.create(createFreelancerDto);
    return await this.freelancerRepository.save(newFreelancer);
  }

  async update(id: number, updateFreelancerDto: UpdateFreelancerDto) {
    const result = await this.freelancerRepository.update(
      id,
      updateFreelancerDto,
    );
    if (result.affected === 0) {
      throw new HttpException('Freelancer not found', HttpStatus.NOT_FOUND);
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.freelancerRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException('Freelancer not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Freelancer deleted successfully' };
  }
}
