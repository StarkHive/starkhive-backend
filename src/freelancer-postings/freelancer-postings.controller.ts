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
import { FreelancerPostingsService } from './freelancer-postings.service';
import { CreateFreelancerDto } from './dto/create-freelancer.dto';
import { UpdateFreelancerDto } from './dto/update-freelancer.dto';
import { CacheService } from "@src/cache/cache.service";

@Controller('freelancer-postings')
export class FreelancerPostingsController {
  constructor(
    private readonly freelancerPostingsService: FreelancerPostingsService,
    private cacheManager: CacheService
  ) {}

  @Get()
  findAll(
    @Query('name') name?: string,
    @Query('location') location?: string,
    @Query('skills') skills?: string,
    @Query('availability') availability?: string,
    @Query('minExperience') minExperience?: string,
    @Query('maxExperience') maxExperience?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.freelancerPostingsService.findAll(
      Number(page),
      Number(limit),
      name,
      location,
      skills,
      availability,
      minExperience ? Number(minExperience) : undefined,
      maxExperience ? Number(maxExperience) : undefined,
      sortBy,
      sortOrder,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const cachedFreelancerPosting = await this.cacheManager.get(`freelancer-postings:${id}`, 'FreelancerPostingsService');
    if (cachedFreelancerPosting) {
      return cachedFreelancerPosting;
    }
    const freelancerPosting = await this.freelancerPostingsService.findOne(Number(id));
    await this.cacheManager.set(`freelancer-postings:${id}`, freelancerPosting);
    return freelancerPosting;
  }

  @Post()
  create(@Body() createFreelancerDto: CreateFreelancerDto) {
    return this.freelancerPostingsService.create(createFreelancerDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateFreelancerDto: UpdateFreelancerDto,
  ) {
    await this.cacheManager.del(`freelancer-postings:${id}`);
    return this.freelancerPostingsService.update(
      Number(id),
      updateFreelancerDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.cacheManager.del(`freelancer-postings:${id}`);
    return this.freelancerPostingsService.remove(Number(id));
  }
}
