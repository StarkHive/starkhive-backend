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

@Controller('endorsements')
export class EndorsementController {
  constructor(
    private readonly endorsementService: EndorsementService,

    private endorsementAnalytics: EndorsementAnalyticsService,
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
    return this.endorsementService.getEndorsementsForProfile(
      profileId,
      sortBy,
      order,
    );
  }

  @Get(':profileId/count')
  @HttpCode(HttpStatus.OK)
  public async getEndorsementCountForProfile(
    @Param('profileId', ParseIntPipe) profileId: number,
  ) {
    const count =
      await this.endorsementService.getEndorsementCountForProfile(profileId);
    return {
      count,
    };
  }

  @Get('analytics/total-over-time')
  public async getTotalEndorsementsOverTime() {
    return this.endorsementAnalytics.getTotalEndorsementsOverTime();
  }

  @Get('analytics/top-skills')
  public async getTopEndorsedSkills(@Query('limit') limit: number) {
    return this.endorsementAnalytics.getTopEndorsedSkills(limit);
  }

  @Get('analytics/most-active-endorsers')
  public async getMostActiveEndorsers(@Query('limit') limit: number) {
    return this.endorsementAnalytics.getMostActiveEndorsers(limit);
  }
}
