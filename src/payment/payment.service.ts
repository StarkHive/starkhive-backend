import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly secretKey = process.env.PAYSTACK_SECRET_KEY;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async getPaymentsByContract(contractId: string, userId?: string) {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.contractId = :contractId', { contractId });

    if (userId) {
      query.andWhere('payment.userId = :userId', { userId });
    }

    return query.getMany();
  }

  async getPaymentByReference(reference: string) {
    const payment = await this.paymentRepository.findOne({
      where: { transactionReference: reference },
    });

    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    return payment;
  }

  async initializePayment(createPaymentDto: CreatePaymentDto) {
    try {
      const response : any  = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: createPaymentDto.email,
          amount: createPaymentDto.amount * 100, // Convert to kobo
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      if (response.data.status) {
        const payment = this.paymentRepository.create({
          amount: createPaymentDto.amount,
          transactionReference: response.data.data.reference,
          status: 'pending',
        });

        await this.paymentRepository.save(payment);
        return response.data;
      } else {
        throw new HttpException(
          'Payment initialization failed',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error: any) {
      this.logger.error(`Payment initialization failed: ${error.message}`);
      throw new HttpException(
        error.response?.data || 'Error initializing payment',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async verifyPayment(reference: string) {
    try {
      const response: any = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      if (response.data.status) {
        const payment = await this.paymentRepository.findOne({
          where: { transactionReference: reference },
        });

        if (!payment) {
          throw new HttpException(
            'Payment record not found',
            HttpStatus.NOT_FOUND,
          );
        }

        payment.status = response.data.data.status;
        await this.paymentRepository.save(payment);

        return response.data;
      } else {
        throw new HttpException(
          'Payment verification failed',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error: any) {
      this.logger.error(`Payment verification failed: ${error.message}`);
      throw new HttpException(
        error.response?.data || 'Error verifying payment',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    return this.paymentRepository.find();
  }

  async findOne(id: string) {
    const payment = await this.paymentRepository.findOne({ where: { id } });

    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.paymentRepository.findOne({ where: { id } });

    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    Object.assign(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }

  async remove(id: string) {
    const result = await this.paymentRepository.delete(id);

    if (result.affected === 0) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'Payment deleted successfully' };
  }

  async handleWebhook(signature: string, payload: any) {
    this.logger.log('Webhook received', { signature, payload });
    return { message: 'Webhook processed successfully' };
  }

  async handleCallback(reference: string) {
    this.logger.log(`Callback received for reference: ${reference}`);
    return { status: 'success' };
  }
}
