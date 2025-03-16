import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../company.entity';

@Injectable()
export class FindACompanyProvider {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  // find a company by ID
  public async findACompanyById(id: number, withDeleted: boolean = false) {
    const company = await this.companyRepository.findOne({
      where: { id },
      withDeleted,
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found.`);
    }

    return company;
  }
}