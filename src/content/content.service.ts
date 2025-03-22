import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Content } from './entities/content.entity';
import { ContentFilterDto } from './dto/content-filter.dto';
import { ModerateContentDto } from './dto/moderate-content.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
  ) {}

  async findAll(filter: ContentFilterDto, page = 1, limit = 10) {
    const queryBuilder = this.contentRepository.createQueryBuilder('content')
      .leftJoinAndSelect('content.creator', 'creator');
    
    if (filter.status) {
      queryBuilder.andWhere('content.status = :status', { status: filter.status });
    }
    
    if (filter.type) {
      queryBuilder.andWhere('content.type = :type', { type: filter.type });
    }
    
    if (filter.creatorId) {
      queryBuilder.andWhere('content.creatorId = :creatorId', { creatorId: filter.creatorId });
    }
    
    if (filter.search) {
      queryBuilder.andWhere('(content.title LIKE :search OR content.body LIKE :search)', 
        { search: `%${filter.search}%` });
    }
    
    // Add pagination
    queryBuilder
      .orderBy('content.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    
    const [items, total] = await queryBuilder.getManyAndCount();
    
    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const content = await this.contentRepository.findOne({ 
      where: { id },
      relations: ['creator'] 
    });
    
    if (!content) {
      throw new NotFoundException(`Content with ID "${id}" not found`);
    }
    
    return content;
  }

  async moderate(id: string, moderateContentDto: ModerateContentDto, moderatorId: string) {
    const content = await this.findOne(id);
    
    await this.contentRepository.update(id, {
      status: moderateContentDto.status,
      moderatedBy: moderatorId,
      moderatedAt: new Date(),
      moderationNotes: moderateContentDto.moderationNotes,
    });
    
    return this.findOne(id);
  }

  async getContentStats() {
    const stats = await this.contentRepository
      .createQueryBuilder('content')
      .select('content.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('content.status')
      .getRawMany();
    
    return stats;
  }
}