import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('mfa')
@UseGuards(JwtAuthGuard)
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Post('generate')
  async generateSecret(@CurrentUser() user: any) {
    return this.mfaService.generateSecret(user.id);
  }

  @Post('enable')
  async enableMfa(
    @CurrentUser() user: any,
    @Body('token') token: string,
  ) {
    return this.mfaService.verifyAndEnableMfa(user.id, token);
  }

  @Post('disable')
  async disableMfa(@CurrentUser() user: any) {
    return this.mfaService.disableMfa(user.id);
  }

  @Post('verify')
  async verifyToken(
    @CurrentUser() user: any,
    @Body('token') token: string,
  ) {
    return this.mfaService.verifyMfaToken(user.id, token);
  }
} 