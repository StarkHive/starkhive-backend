import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigModule } from '@nestjs/config';
import { TransactionLogService } from './transaction-log.service';
import { TransactionLog } from './entities/transaction-log.entity';
import { WebhookLog } from './entities/webhook-log.entity';
import { CallbackLog } from './entities/callback-log.entity';
import { Payment } from './entities/payment.entity';
import { PaymentRepository } from './repositories/payment.repository';
import { User } from '../user/entities/user.entity';
import { Contract } from '../contract/entities/contract.entity';
import { PermissionGuard } from 'src/auth/guards/permissions.guard';
import { PermissionService } from 'src/auth/services/permission.service';
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      TransactionLog,
      WebhookLog,
      CallbackLog,
      Payment,
      User,
      Contract,
    ]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    TransactionLogService,
    PermissionGuard,
    PermissionService,
    PaymentRepository,
  ],
  exports: [PaymentService, PermissionService],
})
export class PaymentModule {}
