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

@Controller('freelancer-postings')
export class FreelancerPostingsController {
  constructor(
    private readonly freelancerPostingsService: FreelancerPostingsService,
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
  findOne(@Param('id') id: number) {
    return this.freelancerPostingsService.findOne(Number(id));
  }

  @Post()
  create(@Body() createFreelancerDto: CreateFreelancerDto) {
    return this.freelancerPostingsService.create(createFreelancerDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateFreelancerDto: UpdateFreelancerDto,
  ) {
    return this.freelancerPostingsService.update(
      Number(id),
      updateFreelancerDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.freelancerPostingsService.remove(Number(id));
  }
}
