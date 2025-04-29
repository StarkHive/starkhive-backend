import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { VoteDisputeDto } from './dto/vote-dispute.dto';
import { DisputeStatus } from './entities/dispute.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  async createDispute(
    @Body() createDisputeDto: CreateDisputeDto,
    @Request() req: ExpressRequest & { user: { id: string } },
  ) {
    return this.disputeService.createDispute(createDisputeDto, req.user.id);
  }

  @Post(':id/vote')
  @Roles(Role.SECURITY_AUDITOR)
  async vote(
    @Param('id') id: string,
    @Body() voteDto: VoteDisputeDto,
    @Request() req: ExpressRequest & { user: { id: string } },
  ) {
    return this.disputeService.vote(id, req.user.id, voteDto);
  }

  @Get(':id')
  async getDispute(@Param('id') id: string) {
    return this.disputeService.getDispute(id);
  }

  @Get()
  async listDisputes(@Query('status') status?: DisputeStatus) {
    return this.disputeService.listDisputes(status);
  }
} 