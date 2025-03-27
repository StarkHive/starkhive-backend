import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CompanyPosting } from './entities/company-posting.entity';
import { CreateCompanyPostingDto } from './dto/create-company-posting.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyPostingsService {
  constructor(
    @InjectRepository(CompanyPosting)
    private readonly companyRepository: Repository<CompanyPosting>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    name?: string,
    description?: string,
    location?: string,
    industry?: string,
    companySize?: number,
    sortBy: string = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC', // Default: newest first
  ) {
    const where: any = {};

    if (name) {
      where.name = ILike(`%${name}%`);
    }

    if (location) {
      where.location = ILike(`%${location}%`);
    }
    if (industry) {
      where.industry = ILike(`%${industry}%`);
    }
    if (description) {
      where.description = ILike(`%${description}%`);
    }

    if (companySize) {
      where.companySize = companySize;
    }

    // Define allowed sorting fields
    const validSortFields: Record<string, string> = {
      relevance: 'search_vector', // Full-text search column
      createdAt: 'createdAt', // Default sorting by creation date
      salary: 'salary',
    };

    const orderByField = validSortFields[sortBy] || 'createdAt'; // Default to createdAt
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'; // Ensure valid order

    const [companies, total] = await this.companyRepository.findAndCount({
      select: [
        'id',
        'name',
        'description',
        'industry',
        'location',
        'createdAt',
      ], // Fetch only required columns
      where,
      order: { [orderByField]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { total, page, limit, sortBy, sortOrder, companies };
  }

  async findOne(id: number) {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new HttpException(
        'Company posting not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return company;
  }

  async create(createCompanyDto: CreateCompanyPostingDto) {
    const newCompany = this.companyRepository.create(createCompanyDto);
    return await this.companyRepository.save(newCompany);
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    const result = await this.companyRepository.update(id, updateCompanyDto);
    if (result.affected === 0) {
      throw new HttpException(
        'Company posting not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.companyRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException(
        'Company posting not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return { message: 'Company posting deleted successfully' };
  }
}
