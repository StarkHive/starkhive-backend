import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { CreateCompanyDto } from './DTO/create-company.dto';
import { CompanyService } from './provider/company.service';
import { UpdateCompanyDto } from './DTO/updateCompanyDto';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  async findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.companyService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateCompanyDto: UpdateCompanyDto) {
    return await this.companyService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.companyService.remove(id);
  }
}