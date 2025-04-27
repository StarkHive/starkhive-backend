import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FreelancerProfileService } from './freelancer-profile.service';
import { CreateFreelancerProfileDto } from './dto/create-freelancer-profile.dto';
import { UpdateFreelancerProfileDto } from './dto/update-freelancer-profile.dto';
import { SearchFreelancerProfileDto } from './dto/search-freelancer-profile.dto';
import { FreelancerPortfolioService } from './freelancer-portfolio.service';
import { CacheService } from '@src/cache/cache.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('freelancer-profiles')
@Controller('freelancer-profiles')
export class FreelancerProfileController {
  constructor(
    private readonly freelancerProfileService: FreelancerProfileService,
    private readonly freelancerPortfolioService: FreelancerPortfolioService,
    private cacheManager: CacheService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new freelancer profile' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  create(@Body() createFreelancerProfileDto: CreateFreelancerProfileDto) {
    return this.freelancerProfileService.createProfile(
      createFreelancerProfileDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all freelancer profiles' })
  @ApiResponse({ status: 200, description: 'Return all profiles' })
  async findAll() {
    const cachedFreelancerProfiles = await this.cacheManager.get(
      `freelancer-profile:all`,
      'FreelancerProfileService',
    );
    if (cachedFreelancerProfiles) {
      return cachedFreelancerProfiles;
    }
    const freelancerProfiles = await this.freelancerProfileService.findAll(); // Now it should work without errors
    await this.cacheManager.set(`freelancer-profile:all`, freelancerProfiles);
    return freelancerProfiles;
  }

  @Get('search')
  @ApiOperation({ summary: 'Search freelancer profiles with filters' })
  @ApiResponse({ status: 200, description: 'Return filtered profiles' })
  @ApiQuery({ type: SearchFreelancerProfileDto })
  async searchProfiles(@Query() searchParams: SearchFreelancerProfileDto) {
    return this.freelancerProfileService.searchProfiles(searchParams);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get freelancer profile by user ID' })
  @ApiResponse({ status: 200, description: 'Return profile by user ID' })
  async getProfileByUserId(@Param('id') id: string) {
    const cachedFreelancerProfile = await this.cacheManager.get(
      `freelancer-profile:${id}`,
      'FreelancerProfileService',
    );
    if (cachedFreelancerProfile) {
      return cachedFreelancerProfile;
    }
    const freelancerProfile =
      await this.freelancerProfileService.getProfileByUserId(id); // Fetch profile by user ID
    await this.cacheManager.set(`freelancer-profile:${id}`, freelancerProfile);
    return freelancerProfile;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update freelancer profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateFreelancerProfileDto: UpdateFreelancerProfileDto,
  ) {
    await this.cacheManager.del(`freelancer-profile:${id}`);
    const { experience, skills } = updateFreelancerProfileDto;
    if (experience) {
      return this.freelancerProfileService.updateExperience(id, experience);
    }
    if (skills) {
      return this.freelancerProfileService.updateSkills(id, skills);
    }
    // You can expand with other updates like portfolioLinks
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a freelancer profile' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully' })
  async deleteProfile(@Param('id') id: string) {
    await this.cacheManager.del(`freelancer-profile:${id}`);
  }

  @Get('portfolio')
  @ApiOperation({ summary: 'Get freelancer portfolio projects' })
  @ApiResponse({ status: 200, description: 'Return portfolio projects' })
  async getPortfolioProject(
    @Query('sort') sort: 'recent' | 'popular',
    @Query('category') category?: string,
    @Query('tags') tags?: string[],
  ) {
    const filter = {
      category,
      tags,
      sortBy: sort || undefined,
    };
    return this.freelancerPortfolioService.findProjects(filter);
  }

  @Post(':/id/view')
  @ApiOperation({ summary: 'Track freelancer portfolio project views' })
  @ApiResponse({ status: 200, description: 'Views tracked successfully' })
  async trackProjectViews(@Param('id') projectId: string) {
    return this.freelancerPortfolioService.incrementViews(projectId);
  }
}
