import { Injectable } from '@nestjs/common';
import { CreateReputationAppealDto } from '../dto/create-reputation-appeal.dto';
import { AppealStatus, ReputationAppeal } from '../entities/reputation-appeal.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '@src/user/user.service';
import { Repository } from 'typeorm';
import { TransactionLogService } from '@src/payment/transaction-log.service';

@Injectable()
export class ReputationAppealService {
  constructor(
    @InjectRepository(ReputationAppeal)
    private appealRepo: Repository<ReputationAppeal>,
    private userService: UserService,
    private transactionService: TransactionLogService,
  ) {}

  async fileAppeal(userId: string, transactionId: number, reason: string) {
    const user = await this.userService.findOne(userId);

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }


    const transaction = await this.transactionService.findOne(transactionId);
    if (!transaction) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }

    const appeal = this.appealRepo.create({ user, transaction, reason });
    return this.appealRepo.save(appeal);
  }

  async resolveAppeal(id: string, status: AppealStatus, reviewerId: string) {
      // Validate that status is one of the allowed values (not PENDING)
      if (status === AppealStatus.PENDING) {
        throw new Error('Cannot resolve appeal with PENDING status');
      }
       const appeal = await this.appealRepo.findOneOrFail({ where: { id } });
       appeal.status = status;
       appeal.reviewedBy = reviewerId;
       appeal.reviewedAt = new Date();
       return this.appealRepo.save(appeal);
     }

  async getPendingAppeals() {
    return this.appealRepo.find({ where: { status: AppealStatus.PENDING }, relations: ['user', 'transaction'] });
  }
}

