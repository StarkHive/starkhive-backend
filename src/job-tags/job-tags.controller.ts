import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  HttpStatus,
  Get,
  Query,
  HttpException,
} from '@nestjs/common';
import { JobTagsService } from './job-tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { VoteTagDto } from './dto/vote-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobIdDto } from './decorators/jobId.decorator';
import { Request } from 'express';

@Controller('job-tags')
@UseGuards(JwtAuthGuard) // Protect all endpoints with authentication
export class JobTagsController {
  constructor(private readonly jobTagsService: JobTagsService) {}

  @Post('submit')
  async submitTag(@Body() createTagDto: CreateTagDto, @Req() req: any) {
    return this.jobTagsService.submitTag(createTagDto, req.user.id);
  }

  @Patch('vote/:tagId')
  async voteOnTag(
    @Param('tagId') tagId: string,
    @Body() voteTagDto: VoteTagDto,
    @Req() req: any,
  ) {
    // Check if user has reached their daily vote limit
    const hasReachedLimit = await this.jobTagsService.checkUserVoteLimit(
      req.user.id,
    );
    if (hasReachedLimit) {
      throw new HttpException(
        'You have reached your daily vote limit',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return this.jobTagsService.voteOnTag(tagId, voteTagDto, req.user.id);
  }

  @Get()
  async getTagsForJob(@Query() query: JobIdDto) {
    return this.jobTagsService.getTagsForJob(query.jobId);
  }
}
