import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from './search.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { SearchFreelancersDto } from './dto/search-freelancers.dto';
import { SearchCompaniesDto } from './dto/search-companies.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('messages')
  async searchMessages(@Query() searchDto: SearchDto) {
    return this.searchService.searchMessages(searchDto);
  }
}
  @Get('jobs')
  @ApiOperation({ summary: 'Search jobs with advanced filtering and sorting' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns paginated job search results with total count'
  })
  async searchJobs(@Query() searchDto: SearchJobsDto) {
    return this.searchService.searchJobs(searchDto);
  }

  @Get('freelancers')
  @ApiOperation({ summary: 'Search freelancers with advanced filtering and sorting' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns paginated freelancer search results with total count'
  })
  async searchFreelancers(@Query() searchDto: SearchFreelancersDto) {
    return this.searchService.searchFreelancers(searchDto);
  }

  @Get('companies')
  @ApiOperation({ summary: 'Search companies with advanced filtering and sorting' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns paginated company search results with total count'
  })
  async searchCompanies(@Query() searchDto: SearchCompaniesDto) {
    return this.searchService.searchCompanies(searchDto);
  }
}
