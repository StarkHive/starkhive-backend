import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CompanyPostingsService } from './company-postings.service';
import { CreateCompanyPostingDto } from './dto/create-company-posting.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('company-postings')
export class CompanyPostingsController {
  constructor(
    private readonly companyPostingsService: CompanyPostingsService,
  ) {}

  @Get()
  findAll(
    @Query('name') name?: string,
    @Query('location') location?: string,
    @Query('industry') industry?: string,
    @Query('description') description?: string,
    @Query('companySize') companySize?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.companyPostingsService.findAll(
      Number(page),
      Number(limit),
      name,
      location,
      industry,
      description,
      Number(companySize),
      sortBy,
      sortOrder,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.companyPostingsService.findOne(Number(id));
  }

  @Post()
  create(@Body() createCompanyDto: CreateCompanyPostingDto) {
    return this.companyPostingsService.create(createCompanyDto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyPostingsService.update(Number(id), updateCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.companyPostingsService.remove(Number(id));
  }
}
