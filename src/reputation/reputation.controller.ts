// src/reputation/reputation.controller.ts

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReputationService } from './provider/reputation.service'; 
import { TimelineQueryDto } from './dto/timeline-query.dto';

@Controller('reputation')
export class ReputationController {
  constructor(private readonly reputationService: ReputationService) {}

  @Get(':userId/timeline')
  async getUserTimeline(
    @Param('userId') userId: string,
    @Query() query: TimelineQueryDto,
  ) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    return this.reputationService.getUserTimeline(userId, page, limit);
  }
}
