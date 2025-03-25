import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionLog } from './entities/transaction-log.entity';
import { WebhookLog } from './entities/webhook-log.entity';
import { CallbackLog } from './entities/callback-log.entity';

@Injectable()
export class TransactionLogService {
  private readonly logger = new Logger(TransactionLogService.name);

  constructor(
    @InjectRepository(TransactionLog)
    private transactionLogRepository: Repository<TransactionLog>,
    @InjectRepository(WebhookLog)
    private webhookLogRepository: Repository<WebhookLog>,
    @InjectRepository(CallbackLog)
    private callbackLogRepository: Repository<CallbackLog>,
  ) {}

  async logTransaction(data: {
    email: string;
    amount?: number;
    reference?: string;
    type: string;
    status: string;
    metadata?: any;
    error?: string;
  }) {
    try {
      const transactionLog = new TransactionLog();
      transactionLog.email = data.email;
      transactionLog.amount = data.amount;
      transactionLog.reference = data.reference;
      transactionLog.type = data.type;
      transactionLog.status = data.status;
      transactionLog.metadata = data.metadata ? JSON.stringify(data.metadata) : null;
      transactionLog.error = data.error;

      return await this.transactionLogRepository.save(transactionLog);
    } catch (error) {
      this.logger.error(`Failed to log transaction: ${error.message}`, error.stack);
    }
  }

  async updateTransaction(data: {
    reference?: string;
    email?: string;
    status?: string;
    amount?: number;
    paymentDate?: Date;
    metadata?: any;
    error?: string;
    failureReason?: string;
  }) {
    try {
      let query: any = {};
      
      if (data.reference) {
        query.reference = data.reference;
      } else if (data.email) {
        query.email = data.email;
      } else {
        throw new Error('Either reference or email is required for updating transaction');
      }
      
      const transactionLog = await this.transactionLogRepository.findOne({ where: query });
      
      if (!transactionLog) {
        this.logger.warn(`Transaction not found for update: ${JSON.stringify(query)}`);
        return;
      }
      
      if (data.status) transactionLog.status = data.status;
      if (data.amount) transactionLog.amount = data.amount;
      if (data.paymentDate) transactionLog.paymentDate = data.paymentDate;
      if (data.metadata) transactionLog.metadata = JSON.stringify(data.metadata);
      if (data.error) transactionLog.error = data.error;
      if (data.failureReason) transactionLog.failureReason = data.failureReason;
      if (data.reference && !transactionLog.reference) transactionLog.reference = data.reference;
      
      return await this.transactionLogRepository.save(transactionLog);
    } catch (error) {
      this.logger.error(`Failed to update transaction: ${error.message}`, error.stack);
    }
  }

  async logWebhook(data: {
    event: string;
    reference: string;
    data: any;
  }) {
    try {
      const webhookLog = new WebhookLog();
      webhookLog.event = data.event;
      webhookLog.reference = data.reference;
      webhookLog.payload = JSON.stringify(data.data);

      return await this.webhookLogRepository.save(webhookLog);
    } catch (error) {
      this.logger.error(`Failed to log webhook: ${error.message}`, error.stack);
    }
  }

  async logCallback(data: {
    reference: string;
    status: string;
    error?: string;
  }) {
    try {
      const callbackLog = new CallbackLog();
      callbackLog.reference = data.reference;
      callbackLog.status = data.status;
      callbackLog.error = data.error;

      return await this.callbackLogRepository.save(callbackLog);
    } catch (error) {
      this.logger.error(`Failed to log callback: ${error.message}`, error.stack);
    }
  }
}
