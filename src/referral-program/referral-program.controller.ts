import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common"
import { ReferralProgramService } from "./referral-program.service"
import { ClaimReferralDto } from "./dto/claim-referral.dto"
import { ProcessMilestoneDto } from "./dto/process-milestone.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Role } from "@src/auth/enums/role.enum"
import { CreateReferralDto } from "./dto/create-referral-program.dto"

@Controller("referral-program")
export class ReferralProgramController {
  constructor(private readonly referralProgramService: ReferralProgramService) {}

  @Post('generate-code')
  @UseGuards(JwtAuthGuard)
  async generateReferralCode(@Body('userId') userId: string) {
    const referralCode = await this.referralProgramService.generateReferralCode(userId);
    return { referralCode };
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createReferral(@Body() createReferralDto: CreateReferralDto) {
    return this.referralProgramService.createReferral(createReferralDto);
  }

  @Post('claim')
  @UseGuards(JwtAuthGuard)
  async claimReferral(@Body() claimReferralDto: ClaimReferralDto) {
    return this.referralProgramService.claimReferral(claimReferralDto);
  }

  @Post('process-milestone')
  @UseGuards(JwtAuthGuard)
  async processMilestone(@Body() processMilestoneDto: ProcessMilestoneDto) {
    return this.referralProgramService.processMilestone(processMilestoneDto);
  }

  @Get('user/:userId/referrals')
  @UseGuards(JwtAuthGuard)
  async getUserReferrals(@Param('userId') userId: string) {
    return this.referralProgramService.getUserReferrals(userId);
  }

  @Get('user/:userId/rewards')
  @UseGuards(JwtAuthGuard)
  async getUserRewards(@Param('userId') userId: string) {
    return this.referralProgramService.getUserRewards(userId);
  }

  // Admin endpoints
  @Get("admin/tree/:userId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getReferralTree(@Param('userId') userId: string, @Query('depth') depth: number = 3) {
    return this.referralProgramService.getReferralTree(userId, depth)
  }

  @Get("admin/stats")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAdminStats() {
    return this.referralProgramService.getAdminStats()
  }
}
