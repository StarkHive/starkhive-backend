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
import { CacheService } from "@src/cache/cache.service";

@Controller('company-postings')
export class CompanyPostingsController {
  constructor(
    private readonly companyPostingsService: CompanyPostingsService,
    private cacheManager: CacheService
  ) {}

  @Get()
  async findAll(
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
    const cachedCompanyPostings = await this.cacheManager.get(`company-postings:all`, 'CompanyPostingsService');
    if (cachedCompanyPostings) {
      return cachedCompanyPostings;
    }
    const companyPostings = await this.companyPostingsService.findAll(
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
    await this.cacheManager.set(`company-postings:all`, companyPostings);
    return companyPostings;
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const cachedCompanyPosting = await this.cacheManager.get(`company-postings:${id}`, 'CompanyPostingsService');
    if (cachedCompanyPosting) {
      return cachedCompanyPosting;
    }
    const companyPosting = await this.companyPostingsService.findOne(Number(id));
    await this.cacheManager.set(`company-postings:${id}`, companyPosting);
    return companyPosting;
  }

  @Post()
  create(@Body() createCompanyDto: CreateCompanyPostingDto) {
    return this.companyPostingsService.create(createCompanyDto);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateCompanyDto: UpdateCompanyDto) {
    await this.cacheManager.del(`company-postings:${id}`);
    return await this.companyPostingsService.update(Number(id), updateCompanyDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.cacheManager.del(`company-postings:${id}`);
    return await this.companyPostingsService.remove(Number(id));
  }
}
