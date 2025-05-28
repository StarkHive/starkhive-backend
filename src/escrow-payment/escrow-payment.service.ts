import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EscrowPayment } from './entities/escrow-payment.entity';
import { EscrowPaymentSplit } from './entities/escrow-payment-split.entity';
import { EscrowPaymentAuditLog } from './entities/escrow-payment-audit-log.entity';

@Injectable()
export class EscrowPaymentService {
  constructor(
    @InjectRepository(EscrowPayment)
    private escrowPaymentRepo: Repository<EscrowPayment>,
    @InjectRepository(EscrowPaymentSplit)
    private splitRepo: Repository<EscrowPaymentSplit>,
    @InjectRepository(EscrowPaymentAuditLog)
    private auditRepo: Repository<EscrowPaymentAuditLog>,
  ) {}

  async createEscrowPayment(data: {
    projectId: string;
    totalAmount: number;
    splitType: 'milestone' | 'participant';
    splits: Array<{ milestoneId?: string; recipientId?: string; percentage: number }>;
  }): Promise<EscrowPayment> {
    const { projectId, totalAmount, splitType, splits } = data;

    const totalPercent = splits.reduce((sum, s) => sum + s.percentage, 0);
    if (Math.abs(totalPercent - 100) > 0.01) {
      throw new BadRequestException('Total split percentage must be 100');
    }

    const payment = this.escrowPaymentRepo.create({
      projectId,
      totalAmount,
      splitType,
      splits: splits.map(s =>
        this.splitRepo.create({
          milestoneId: s.milestoneId,
          recipientId: s.recipientId,
          percentage: s.percentage,
          amount: Number(((totalAmount * s.percentage) / 100).toFixed(2)),
          status: 'pending',
        }),
      ),
      status: 'pending',
    });

    return this.escrowPaymentRepo.save(payment);
  }

  async releaseSplit(splitId: string, details: any): Promise<EscrowPaymentSplit> {
    const split = await this.splitRepo.findOne({
      where: { id: splitId },
      relations: ['escrowPayment', 'auditLogs'],
    });

    if (!split) throw new NotFoundException('Split not found');
    if (split.status === 'completed') throw new BadRequestException('Split already completed');

    // Mark split as completed
    split.status = 'completed';
    await this.splitRepo.save(split);

    // Log audit
    await this.auditRepo.save(
      this.auditRepo.create({
        split,
        action: 'release',
        details,
      }),
    );

    // Update parent payment status
    const payment = await this.escrowPaymentRepo.findOne({
      where: { id: split.escrowPayment.id },
      relations: ['splits'],
    });

    if (!payment) {
      throw new NotFoundException('Parent payment not found');
    }

    if (payment.splits.every(s => s.status === 'completed')) {
      payment.status = 'completed';
    } else if (payment.splits.some(s => s.status === 'completed')) {
      payment.status = 'partial';
    }

    await this.escrowPaymentRepo.save(payment);

    return split;
  }

  async getAuditLogs(splitId: string): Promise<EscrowPaymentAuditLog[]> {
    return this.auditRepo.find({
      where: { split: { id: splitId } },
      order: { timestamp: 'DESC' },
    });
  }
}
