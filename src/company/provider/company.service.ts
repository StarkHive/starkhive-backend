import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/updateCompanyDto';

@Injectable()
export class CompanyService {
  // Create a company
  async create(createCompanyDto: CreateCompanyDto) {
    return 'Company created successfully!';
  }

  // Get all companies
  async findAll() {
    return 'Returning list of companies!';
  }

  // Get one company by ID
  async findOne(id: number) {
    return `Returning company with ID ${id}!`;
  }

  // Update a company
  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return `Updating company with ID ${id}!`;
  }

  // Delete a company
  async remove(id: number) {
    return `Removing company with ID ${id}!`;
  }
}
