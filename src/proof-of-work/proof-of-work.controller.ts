import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProofOfWorkService } from './proof-of-work.service';
import { CreateProofOfWorkDto } from './dto/create-proof-of-work.dto';
import { UpdateProofOfWorkDto } from './dto/update-proof-of-work.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('proof-of-work')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProofOfWorkController {
  constructor(private readonly proofOfWorkService: ProofOfWorkService) {}

  @Post()
  @Roles(Role.FREELANCER)
  create(
    @CurrentUser('id') freelancerId: string,
    @Body() createProofOfWorkDto: CreateProofOfWorkDto
  ) {
    return this.proofOfWorkService.create(freelancerId, createProofOfWorkDto);
  }

  @Get()
  findAll(
    @Query('jobId') jobId?: string,
    @Query('freelancerId') freelancerId?: string
  ) {
    return this.proofOfWorkService.findAll(jobId, freelancerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proofOfWorkService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Body() updateProofOfWorkDto: UpdateProofOfWorkDto
  ) {
    const isClient = role === Role.COMPANY;
    return this.proofOfWorkService.update(id, userId, isClient, updateProofOfWorkDto);
  }

  @Delete(':id')
  @Roles(Role.FREELANCER)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.proofOfWorkService.remove(id, userId);
  }
}
