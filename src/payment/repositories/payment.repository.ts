import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';

@Injectable()
export class PaymentRepository extends Repository<Payment> {
  constructor(private dataSource: DataSource) {
    super(Payment, dataSource.createEntityManager());
  }

  async findByReference(reference: string): Promise<Payment | null> {
    return this.findOne({ where: { transactionReference: reference } });
  }

  async findByContractAndUser(contractId: string, userId: string): Promise<Payment[]> {
    return this.find({
      where: {
        contract: { id: contractId },
        user: { id: userId }
      },
      relations: ['contract', 'user']
    });
  }
}
