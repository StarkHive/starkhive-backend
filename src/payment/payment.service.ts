import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';
import { CreatePaymentDto } from './dto/create-payment.dto';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { TransactionLogService } from './transaction-log.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  
  constructor(
    private configService: ConfigService,
    private transactionLogService: TransactionLogService,
  ) {}

  async initializePayment(createPaymentDto: CreatePaymentDto) {
    try {
      const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
      const callbackUrl = this.configService.get<string>('CALLBACK_URL', 'https://yourdomain.com/payment/callback');
      
      // Log the payment initialization attempt
      await this.transactionLogService.logTransaction({
        email: createPaymentDto.email,
        amount: createPaymentDto.amount,
        type: 'initialize',
        status: 'pending',
        metadata: { user_id: createPaymentDto.userId, purpose: createPaymentDto.purpose }
      });
      
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: createPaymentDto.email,
          amount: createPaymentDto.amount * 100, // Convert to kobo/cents
          callback_url: callbackUrl,
          metadata: {
            user_id: createPaymentDto.userId,
            purpose: createPaymentDto.purpose,
          },
        },
        {
          headers: { Authorization: `Bearer ${secretKey}` },
        },
      );
      
      if (response.data.status) {
        // Update the transaction log with the reference
        await this.transactionLogService.updateTransaction({
          email: createPaymentDto.email,
          reference: response.data.data.reference,
          status: 'initialized',
        });
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`Payment initialization failed: ${error.message}`, error.stack);
      await this.transactionLogService.logTransaction({
        email: createPaymentDto.email,
        amount: createPaymentDto.amount,
        type: 'initialize',
        status: 'failed',
        error: error.message,
      });
      throw new HttpException('Payment initialization failed', HttpStatus.BAD_REQUEST);
    }
  }

  async verifyPayment(reference: string) {
    try {
      const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
      const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${secretKey}` },
      });
      
      if (response.data.status) {
        const transaction = response.data.data;
        
        // Update transaction log with verification result
        await this.transactionLogService.updateTransaction({
          reference,
          status: transaction.status,
          amount: transaction.amount / 100,
          paymentDate: new Date(transaction.paid_at),
        });
        
        return response.data;
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`Payment verification failed: ${error.message}`, error.stack);
      await this.transactionLogService.updateTransaction({
        reference,
        status: 'verification_failed',
        error: error.message,
      });
      throw new HttpException('Payment verification failed', HttpStatus.BAD_REQUEST);
    }
  }

  async handleWebhook(signature: string, payload: any) {
    try {
      const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
      const hash = crypto.createHmac('sha512', secretKey).update(JSON.stringify(payload)).digest('hex');
      
      if (hash !== signature) {
        this.logger.warn('Invalid webhook signature received');
        throw new HttpException('Invalid webhook signature', HttpStatus.FORBIDDEN);
      }
      
      // Process different event types
      if (payload.event === 'charge.success') {
        await this.processSuccessfulPayment(payload.data);
      } else if (payload.event === 'charge.failed') {
        await this.processFailedPayment(payload.data);
      }
      
      // Log the webhook event
      await this.transactionLogService.logWebhook({
        event: payload.event,
        reference: payload.data?.reference || 'unknown',
        data: payload,
      });
      
      return { message: 'Webhook received successfully', data: payload };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      throw new HttpException('Webhook processing failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async handleCallback(reference: string) {
    try {
      // Verify the payment status
      const verificationResult = await this.verifyPayment(reference);
      
      // Log the callback
      await this.transactionLogService.logCallback({
        reference,
        status: verificationResult.data.status,
      });
      
      return {
        status: verificationResult.data.status === 'success' ? 'success' : 'failure',
        data: verificationResult.data,
      };
    } catch (error) {
      this.logger.error(`Callback processing failed: ${error.message}`, error.stack);
      await this.transactionLogService.logCallback({
        reference,
        status: 'failed',
        error: error.message,
      });
      return { status: 'failure', error: error.message };
    }
  }

  private async processSuccessfulPayment(data: any) {
    // Update transaction status in database
    await this.transactionLogService.updateTransaction({
      reference: data.reference,
      status: 'success',
      amount: data.amount / 100,
      paymentDate: new Date(),
      metadata: data.metadata,
    });
    
    // Additional business logic based on payment purpose
    if (data.metadata?.purpose === 'contract') {
      // Update contract status, send notifications, etc.
    } else if (data.metadata?.purpose === 'job') {
      // Update job status, notify relevant parties, etc.
    }
    
    this.logger.log(`Payment successful for reference: ${data.reference}`);
  }

  private async processFailedPayment(data: any) {
    // Update transaction status in database
    await this.transactionLogService.updateTransaction({
      reference: data.reference,
      status: 'failed',
      failureReason: data.gateway_response || 'Unknown reason',
    });
    
    this.logger.log(`Payment failed for reference: ${data.reference}`);
  }

  async generateInvoice(generateInvoiceDto: GenerateInvoiceDto): Promise<Payment> {
    const payment = this.paymentRepository.create({
      amount: generateInvoiceDto.amount,
      currency: 'USD', // or get from config
      status: 'pending',
      email: generateInvoiceDto.timeEntry.freelancer.email,
      metadata: JSON.stringify({
        timeEntryId: generateInvoiceDto.timeEntry.id,
        projectId: generateInvoiceDto.projectId,
        description: generateInvoiceDto.description
      }),
      contract: generateInvoiceDto.timeEntry.project.contract,
      user: generateInvoiceDto.timeEntry.freelancer
    });

    return this.paymentRepository.save(payment);
  }
}

