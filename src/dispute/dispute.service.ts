import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Dispute, DisputeStatus, DisputeOutcome } from './entities/dispute.entity';
import { DisputeVote, VoteDecision } from './entities/dispute-vote.entity';
import { User } from '../user/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { VoteDisputeDto } from './dto/vote-dispute.dto';
import { Role } from '../auth/enums/role.enum';
import { DeliveryChannel, NotificationType } from '@src/notifications/entities/notification.entity';

@Injectable()
export class DisputeService {
  constructor(
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
    @InjectRepository(DisputeVote)
    private disputeVoteRepository: Repository<DisputeVote>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,
    private dataSource: DataSource,
  ) {}

  async createDispute(createDisputeDto: CreateDisputeDto, creatorId: string): Promise<Dispute> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const dispute = this.disputeRepository.create({
        ...createDisputeDto,
        creatorId,
        status: DisputeStatus.PENDING,
        outcome: DisputeOutcome.PENDING,
      });
      
      const savedDispute = await queryRunner.manager.save(dispute);
      await this.assignJurors(savedDispute.id, queryRunner);
      
      const populatedDispute = await queryRunner.manager.findOne(Dispute, {
        where: { id: savedDispute.id },
        relations: ['votes', 'votes.juror', 'creator'],
      });
      
      if (!populatedDispute) {
        throw new NotFoundException('Created dispute not found');
      }
      
      await queryRunner.commitTransaction();
      return populatedDispute;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async assignJurors(disputeId: string, existingQueryRunner?: any): Promise<void> {
    const queryRunner = existingQueryRunner || this.dataSource.createQueryRunner();
    const shouldManageTransaction = !existingQueryRunner;

    if (shouldManageTransaction) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }

    try {
      const dispute = await queryRunner.manager.getRepository(Dispute).findOne({
        where: { id: disputeId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!dispute) {
        throw new NotFoundException('Dispute not found');
      }

      const eligibleJurors = await this.userRepository
        .createQueryBuilder('u')
        .where(':role = ANY(u.roles)', { role: Role.JUROR })
        .orderBy('u.jurorReputation', 'DESC')
        .getMany();

      if (eligibleJurors.length < 3) {
        throw new BadRequestException('Not enough eligible jurors available');
      }

      const numberOfJurors = Math.min(5, Math.max(3, Math.floor(eligibleJurors.length / 3)));
      const selectedJurors = eligibleJurors
        .slice(0, numberOfJurors * 2)
        .sort(() => Math.random() - 0.5)
        .slice(0, numberOfJurors);

      dispute.assignedJurorIds = selectedJurors.map(juror => juror.id);
      dispute.status = DisputeStatus.VOTING;
      dispute.votingDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h from now

      await queryRunner.manager.save(dispute);

      // Use createNotification instead of create
      await Promise.all(selectedJurors.map(juror => 
        this.notificationsService.createNotification({
          userId: juror.id,
          type: NotificationType.DISPUTE_ASSIGNMENT,
          content: { message: `New Dispute Assignment: You have been selected as a juror for dispute: ${dispute.title}`, disputeId: dispute.id },
          deliveryChannel: DeliveryChannel.PUSH,
          priority: 0,
        })
      ));
      

      if (shouldManageTransaction) {
        await queryRunner.commitTransaction();
      }
    } catch (err) {
      if (shouldManageTransaction) {
        await queryRunner.rollbackTransaction();
      }
      throw err;
    } finally {
      if (shouldManageTransaction) {
        await queryRunner.release();
      }
    }
  }

  async vote(disputeId: string, jurorId: string, voteDto: VoteDisputeDto): Promise<DisputeVote> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const dispute = await queryRunner.manager.getRepository(Dispute).findOne({
        where: { id: disputeId },
        relations: ['votes'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!dispute) {
        throw new NotFoundException('Dispute not found');
      }

      if (!dispute.assignedJurorIds.includes(jurorId)) {
        throw new BadRequestException('User is not an assigned juror for this dispute');
      }

      if (dispute.status !== DisputeStatus.VOTING) {
        throw new BadRequestException('Dispute is not in voting phase');
      }

      if (dispute.votingDeadline && dispute.votingDeadline < new Date()) {
        throw new BadRequestException('Voting deadline has passed');
      }

      const existingVote = await queryRunner.manager.getRepository(DisputeVote).findOne({
        where: { disputeId, jurorId },
      });

      if (existingVote) {
        throw new BadRequestException('Juror has already voted');
      }

      const vote = this.disputeVoteRepository.create({
        disputeId,
        jurorId,
        decision: voteDto.decision,
        reasoning: voteDto.reasoning,
      });

      const savedVote = await queryRunner.manager.save(vote);

      const totalVotes = await queryRunner.manager
        .getRepository(DisputeVote)
        .count({ where: { disputeId } });
      if (totalVotes === dispute.assignedJurorIds.length && dispute.status === DisputeStatus.VOTING) {
        await this.finalizeDispute(disputeId, queryRunner);
      }

      await queryRunner.commitTransaction();
      return savedVote;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async finalizeDispute(disputeId: string, queryRunner?: any): Promise<void> {
    const repository = queryRunner?.manager.getRepository(Dispute) || this.disputeRepository;
    const voteRepository = queryRunner?.manager.getRepository(DisputeVote) || this.disputeVoteRepository;

    const dispute = await repository.findOne({
      where: { id: disputeId },
      relations: ['votes'],
      lock: { mode: 'pessimistic_write' },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    const votes = await voteRepository.find({ where: { disputeId } });

    const voteCount = {
      [VoteDecision.UPHOLD]: votes.filter((v: DisputeVote) => v.decision === VoteDecision.UPHOLD).length,
      [VoteDecision.REJECT]: votes.filter((v: DisputeVote) => v.decision === VoteDecision.REJECT).length,
      [VoteDecision.ABSTAIN]: votes.filter((v: DisputeVote) => v.decision === VoteDecision.ABSTAIN).length,
    };
    

    const totalNonAbstainVotes = voteCount[VoteDecision.UPHOLD] + voteCount[VoteDecision.REJECT];
    if (totalNonAbstainVotes === 0) {
      dispute.outcome = DisputeOutcome.ESCALATED;
      dispute.status = DisputeStatus.ESCALATED;
    } else if (voteCount[VoteDecision.UPHOLD] > voteCount[VoteDecision.REJECT]) {
      dispute.outcome = DisputeOutcome.UPHELD;
      dispute.status = DisputeStatus.RESOLVED;
    } else if (voteCount[VoteDecision.UPHOLD] < voteCount[VoteDecision.REJECT]) {
      dispute.outcome = DisputeOutcome.REJECTED;
      dispute.status = DisputeStatus.RESOLVED;
    } else {
      dispute.outcome = DisputeOutcome.TIED;
      dispute.status = DisputeStatus.RESOLVED;
    }

    await repository.save(dispute);

    await this.notificationsService.createNotification({
      userId: dispute.creatorId,
      type: NotificationType.DISPUTE_ASSIGNMENT,
      content: {
        message: `Dispute Resolution: Your dispute "${dispute.title}" has been resolved with outcome: ${dispute.outcome}`,
        disputeId: dispute.id,
        outcome: dispute.outcome,
      },
      priority: 10,
      deliveryChannel: DeliveryChannel.PUSH,
    });
    
  }

  async getDispute(id: string): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOne({
      where: { id },
      relations: ['votes', 'votes.juror', 'creator'],
    });
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }
    return dispute;
  }

  async listDisputes(status?: DisputeStatus): Promise<Dispute[]> {
    const query = this.disputeRepository.createQueryBuilder('dispute');
    if (status) {
      query.where('dispute.status = :status', { status });
    }
    return query.getMany();
  }
}
