import { Controller, Get, Post, Body, Param, Headers, UseGuards, Res, HttpStatus, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Response } from 'express';
import { PermissionGuard } from 'src/auth/guards/permissions.guard';
import { CacheService } from "@src/cache/cache.service";

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService, private cacheManager: CacheService) {}

  @UseGuards(PermissionGuard)
  @Post('initialize')
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.initializePayment(createPaymentDto);
  }

  @UseGuards(PermissionGuard)
  @Get('verify/:reference')
  async verify(@Param('reference') reference: string) {
    return this.paymentService.verifyPayment(reference);
  }

  @Post('webhook')
  async handleWebhook(@Headers('x-paystack-signature') signature: string, @Body() payload: any) {
    return this.paymentService.handleWebhook(signature, payload);
  }

  @Get('callback')
  async handleCallback(@Param('reference') reference: string, @Res() res: Response) {
    const result = await this.paymentService.handleCallback(reference);
    
    if (result.status === 'success') {
      return res.status(HttpStatus.OK).redirect('/payment/success');
    } else {
      return res.status(HttpStatus.OK).redirect('/payment/failure');
    }
  }

  @Get('success')
  successPage() {
    return { message: 'Payment successful!' };
  }

  @Get('failure')
  failurePage() {
    return { message: 'Payment failed or was cancelled.' };
  }

  @UseGuards(PermissionGuard)
  @Get('contract/:contractId')
  async getPaymentsByContract(
    @Param('contractId') contractId: string,
    @Query('userId') userId: string,
  ) {
    const cachedPaymentsByContract = await this.cacheManager.get(`payment:contract:${contractId}:${userId}`, 'PaymentService');
    if (cachedPaymentsByContract) {
      return cachedPaymentsByContract;
    }

    const paymentsByContract = await this.paymentService.getPaymentsByContract(contractId, userId);
    await this.cacheManager.set(`payment:contract:${contractId}:${userId}`, paymentsByContract);
    return paymentsByContract;
  }

  @UseGuards(PermissionGuard)
  @Get(':reference')
  async getPaymentByReference(@Param('reference') reference: string) {
    const cachedPaymentsByReference = await this.cacheManager.get(`payment:${reference}`, 'PaymentService');
    if (cachedPaymentsByReference) {
      return cachedPaymentsByReference;
    }

    const paymentsByReference = await this.paymentService.getPaymentByReference(reference);
    await this.cacheManager.set(`payment:${reference}`, paymentsByReference);
    return paymentsByReference;
  }
}
