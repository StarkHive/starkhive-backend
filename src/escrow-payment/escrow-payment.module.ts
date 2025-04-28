import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowPaymentService } from './escrow-payment.service';
import { EscrowPaymentController } from './escrow-payment.controller';
import { EscrowPayment } from './entities/escrow-payment.entity';
import { EscrowPaymentSplit } from './entities/escrow-payment-split.entity';
import { EscrowPaymentAuditLog } from './entities/escrow-payment-audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EscrowPayment, EscrowPaymentSplit, EscrowPaymentAuditLog])],
  controllers: [EscrowPaymentController],
  providers: [EscrowPaymentService],
  exports: [EscrowPaymentService],
})
export class EscrowPaymentModule {}
