import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ReputationAppealService } from './reputation-appeal.service';
import { CreateReputationAppealDto } from '../dto/create-reputation-appeal.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '@src/auth/decorators/roles.decorator';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { AppealStatus } from '../entities/reputation-appeal.entity';
import { Role } from '@src/auth/enums/role.enum';

@Controller('reputation-appeals')
export class ReputationAppealController {
  constructor(private readonly appealService: ReputationAppealService) {}

  @Post()
  @UseGuards(AuthGuard)
  async fileAppeal(@Request() req: any, @Body() body: CreateReputationAppealDto) {
    const { transactionId, reason } = body;
    return this.appealService.fileAppeal(req.user.id, transactionId, reason);
  }

  @Post(':id/resolve')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.JURY)
  async resolveAppeal(@Param('id') id: string, @Body('status') status: AppealStatus, @Request() req: any) {
    return this.appealService.resolveAppeal(id, status, req.user.id);
  }

  @Get('pending')
  @UseGuards(AuthGuard, RolesGuard) 
  @Roles(Role.ADMIN, Role.JURY) 
  async getPendingAppeals() {
    return this.appealService.getPendingAppeals();
  }
}

