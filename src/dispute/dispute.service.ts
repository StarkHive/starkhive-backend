import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Dispute, DisputeStatus, DisputeOutcome } from './entities/dispute.entity';
import { DisputeVote, VoteDecision } from './entities/dispute-vote.entity';
import { User } from '../user/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { VoteDisputeDto } from './dto/vote-dispute.dto';
import { Role } from '../auth/enums/role.enum';

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
    const dispute = this.disputeRepository.create({
      ...createDisputeDto,
      creatorId,
      status: DisputeStatus.PENDING,
      outcome: DisputeOutcome.PENDING,
    });
    
    const savedDispute = await this.disputeRepository.save(dispute);
    await this.assignJurors(savedDispute.id);
    return savedDispute;
  }

  async assignJurors(disputeId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const dispute = await this.disputeRepository.findOne({ where: { id: disputeId } });
      if (!dispute) {
        throw new NotFoundException('Dispute not found');
      }

      // Get eligible jurors using correct role enum and field
      const eligibleJurors = await this.userRepository
        .createQueryBuilder('u')
        .where(':role = ANY(u.roles)', { role: Role.JUROR })
        .orderBy('u.jurorReputation', 'DESC')
        .getMany();

      if (eligibleJurors.length < 3) {
        throw new BadRequestException('Not enough eligible jurors available');
      }

      // Randomly select 3-5 jurors based on their reputation
      const numberOfJurors = Math.min(5, Math.max(3, Math.floor(eligibleJurors.length / 3)));
      const selectedJurors = eligibleJurors
        .slice(0, numberOfJurors * 2) // Take top jurors by reputation
        .sort(() => Math.random() - 0.5) // Shuffle
        .slice(0, numberOfJurors); // Take required number

      dispute.assignedJurorIds = selectedJurors.map(juror => juror.id);
      dispute.status = DisputeStatus.VOTING;
      dispute.votingDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      await queryRunner.manager.save(dispute);

      // Create all notifications in parallel
      await Promise.all(selectedJurors.map(juror => 
        this.notificationsService.create({
          userId: juror.id,
          type: 'DISPUTE_ASSIGNMENT',
          message: `New Dispute Assignment: You have been selected as a juror for dispute: ${dispute.title}`,
          data: { disputeId: dispute.id },
        })
      ));

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async vote(disputeId: string, jurorId: string, voteDto: VoteDisputeDto): Promise<DisputeVote> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const dispute = await this.disputeRepository.findOne({ 
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

      // Check if juror has already voted - protected by transaction
      const existingVote = await this.disputeVoteRepository.findOne({
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

      // Check if all jurors have voted - protected against multiple finalization
      const totalVotes = dispute.votes.length + 1;
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

    const votes = await voteRepository.find({
      where: { disputeId },
    });

    const voteCount = {
      [VoteDecision.UPHOLD]: votes.filter((v: DisputeVote) => v.decision === VoteDecision.UPHOLD).length,
      [VoteDecision.REJECT]: votes.filter((v: DisputeVote) => v.decision === VoteDecision.REJECT).length,
      [VoteDecision.ABSTAIN]: votes.filter((v: DisputeVote) => v.decision === VoteDecision.ABSTAIN).length,
    };

    // Calculate outcome with proper status handling
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

    // Notify creator of outcome
    await this.notificationsService.create({
      userId: dispute.creatorId,
      type: 'DISPUTE_RESOLVED',
      message: `Dispute Resolution: Your dispute "${dispute.title}" has been resolved with outcome: ${dispute.outcome}`,
      data: { disputeId: dispute.id, outcome: dispute.outcome },
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
    const where = status ? { status } : {};
    return this.disputeRepository.find({
      where,
      relations: ['votes', 'creator'],
      order: { createdAt: 'DESC' },
    });
  }
} 