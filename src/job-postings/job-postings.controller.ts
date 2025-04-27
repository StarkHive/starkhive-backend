import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JobPostingsService } from './job-postings.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CacheService } from "@src/cache/cache.service";

@Controller('job-postings')
export class JobPostingsController {
  constructor(private readonly jobPostingsService: JobPostingsService, private cacheManager: CacheService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('title') title?: string,
    @Query('company') company?: string,
    @Query('location') location?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.jobPostingsService.findAll(
      page ?? 1,
      limit ?? 10,
      title,
      company,
      location,
      sortBy,
      sortOrder === 'ASC' || sortOrder === 'DESC' ? sortOrder : 'DESC',
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const cachedJobPosting = await this.cacheManager.get(`job-postings:${id}`, 'JobPostingsService');
    if (cachedJobPosting) {
      return cachedJobPosting;
    }
    const jobPosting = await this.jobPostingsService.findOne(id);
    await this.cacheManager.set(`job-postings:${id}`, jobPosting);
    return jobPosting;
  }

  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobPostingsService.create(createJobDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    await this.cacheManager.del(`job-postings:${id}`);
    return this.jobPostingsService.update(id, updateJobDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.cacheManager.del(`job-postings:${id}`);
    return this.jobPostingsService.remove(id);
  }
}
