import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { EndorsementService } from './endorsement.service';
import { CreateEndorsementDto } from './dto/create-endorsement.dto';
import { EndorsementAnalyticsService } from './endorsement-analytics.service';
import { CacheService } from "@src/cache/cache.service";

@Controller('endorsements')
export class EndorsementController {
  constructor(
    private readonly endorsementService: EndorsementService,

    private endorsementAnalytics: EndorsementAnalyticsService,
    private cacheManager: CacheService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(@Body() createEndorsementDto: CreateEndorsementDto) {
    const endorsement =
      await this.endorsementService.endorseSkill(createEndorsementDto);
    return {
      message: 'Endorsement created successfully',
      endorsement,
    };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  public async remove(@Body() dto: CreateEndorsementDto) {
    const result = await this.endorsementService.removeEndorsement(dto);
    return {
      message: result.message,
    };
  }

  @Get(':profileId')
  @HttpCode(HttpStatus.OK)
  public async getEndorsementsForProfile(
    @Param('profileId') profileId: number,
    @Query('sortBy') sortBy: 'skill' | 'count' | 'date' = 'date',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ) {
    const cachedEndorseMentsForProfile = await this.cacheManager.get(`endorsements:${profileId}:${sortBy}:${order}`, 'EndorsementService');
    if (cachedEndorseMentsForProfile){
      return cachedEndorseMentsForProfile;
    }
    const endorsementsForProfile = await this.endorsementService.getEndorsementsForProfile(
      profileId,
      sortBy,
      order,
    );
    await this.cacheManager.set(`endorsements:${profileId}:${sortBy}:${order}`, endorsementsForProfile);
    return endorsementsForProfile;
  }

  @Get(':profileId/count')
  @HttpCode(HttpStatus.OK)
  public async getEndorsementCountForProfile(
    @Param('profileId', ParseIntPipe) profileId: number,
  ) {
    const cachedCount = await this.cacheManager.get(`endorsements:${profileId}:count`, 'EndorsementService');
    if (cachedCount) {
      return cachedCount;
    }
    const count =
      await this.endorsementService.getEndorsementCountForProfile(profileId);
    await this.cacheManager.set(`endorsements:${profileId}:count`, { count });
    return {
      count,
    };
  }

  @Get('analytics/total-over-time')
  public async getTotalEndorsementsOverTime() {
    const cachedEndorsementsOverTime = await this.cacheManager.get(`endorsements:analytics:total-over-time`, 'EndorsementService');
    if (cachedEndorsementsOverTime) {
      return cachedEndorsementsOverTime;
    }
    const endorsementsOverTime = await this.endorsementAnalytics.getTotalEndorsementsOverTime();
    await this.cacheManager.set(`endorsements:analytics:total-over-time`, endorsementsOverTime);
    return endorsementsOverTime
  }

  @Get('analytics/top-skills')
  public async getTopEndorsedSkills(@Query('limit') limit: number) {
    const cachedTopEndorsedSkills = await this.cacheManager.get(`endorsements:analytics:top-skills:${limit}`, 'EndorsementService');
    if (cachedTopEndorsedSkills) {
      return cachedTopEndorsedSkills;
    }
    const topEndorsedSkills = await this.endorsementAnalytics.getTopEndorsedSkills(limit);
    await this.cacheManager.set(`endorsements:analytics:top-skills:${limit}`, topEndorsedSkills);
    return topEndorsedSkills
  }

  @Get('analytics/most-active-endorsers')
  public async getMostActiveEndorsers(@Query('limit') limit: number) {
    const cachedMostActiveEndorsers = await this.cacheManager.get(`endorsements:analytics:most-active-endorsers:${limit}`, 'EndorsementService');
    if (cachedMostActiveEndorsers) {
      return cachedMostActiveEndorsers;
    }
    const mostActiveEndorsers = await this.endorsementAnalytics.getMostActiveEndorsers(limit);
    await this.cacheManager.set(`endorsements:analytics:most-active-endorsers:${limit}`, mostActiveEndorsers);
    return mostActiveEndorsers
  }
}
