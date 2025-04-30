import { Controller, Post, Body, Param, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { EscrowPaymentService } from './escrow-payment.service';
import { CreateEscrowPaymentDto } from './dto/create-escrow-payment.dto';

@Controller('escrow-payments')
export class EscrowPaymentController {
  constructor(private readonly escrowPaymentService: EscrowPaymentService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createEscrowPayment(@Body() dto: CreateEscrowPaymentDto) {
    return this.escrowPaymentService.createEscrowPayment(dto);
  }

  @Post('release/:splitId')
  async releaseSplit(@Param('splitId') splitId: string, @Body() details: any) {
    return this.escrowPaymentService.releaseSplit(splitId, details);
  }

  @Get('audit/:splitId')
  async getAuditLogs(@Param('splitId') splitId: string) {
    return this.escrowPaymentService.getAuditLogs(splitId);
  }
}
