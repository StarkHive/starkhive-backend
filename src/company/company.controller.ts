import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyService } from './provider/company.service';
import { UpdateCompanyDto } from './dto/updateCompanyDto';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return 'Create method - Company created successfully!';
  }

  @Get()
  async findAll() {
    return 'Find all companies - Returning list of companies!';
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return `Find one company - Returning company with ID ${id}!`;
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return `Update method - Updating company with ID ${id}!`;
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return `Delete method - Removing company with ID ${id}!`;
  }
}
