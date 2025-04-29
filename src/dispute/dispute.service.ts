import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Dispute, DisputeStatus, DisputeOutcome } from './entities/dispute.entity';
import { DisputeVote, VoteDecision } from './entities/dispute-vote.entity';
import { User } from '../user/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { VoteDisputeDto } from './dto/vote-dispute.dto';

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
    const dispute = await this.disputeRepository.findOne({ where: { id: disputeId } });
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    // Get eligible jurors (users with juror role)
    const eligibleJurors = await this.userRepository.find({
      where: { roles: In(['juror']) },
      order: { reputation: 'DESC' },
    });

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

    await this.disputeRepository.save(dispute);

    // Notify selected jurors
    for (const juror of selectedJurors) {
      await this.notificationsService.create({
        userId: juror.id,
        type: 'DISPUTE_ASSIGNMENT',
        message: `New Dispute Assignment: You have been selected as a juror for dispute: ${dispute.title}`,
        data: { disputeId: dispute.id },
      });
    }
  }

  async vote(disputeId: string, jurorId: string, voteDto: VoteDisputeDto): Promise<DisputeVote> {
    const dispute = await this.disputeRepository.findOne({ 
      where: { id: disputeId },
      relations: ['votes'],
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

    // Check if juror has already voted
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

    const savedVote = await this.disputeVoteRepository.save(vote);

    // Check if all jurors have voted
    const totalVotes = dispute.votes.length + 1;
    if (totalVotes === dispute.assignedJurorIds.length) {
      await this.finalizeDispute(disputeId);
    }

    return savedVote;
  }

  private async finalizeDispute(disputeId: string): Promise<void> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
      relations: ['votes'],
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    const votes = await this.disputeVoteRepository.find({
      where: { disputeId },
    });

    const voteCount = {
      [VoteDecision.UPHOLD]: votes.filter(v => v.decision === VoteDecision.UPHOLD).length,
      [VoteDecision.REJECT]: votes.filter(v => v.decision === VoteDecision.REJECT).length,
      [VoteDecision.ABSTAIN]: votes.filter(v => v.decision === VoteDecision.ABSTAIN).length,
    };

    // Calculate outcome
    const totalNonAbstainVotes = voteCount[VoteDecision.UPHOLD] + voteCount[VoteDecision.REJECT];
    if (totalNonAbstainVotes === 0) {
      dispute.outcome = DisputeOutcome.ESCALATED;
    } else if (voteCount[VoteDecision.UPHOLD] > voteCount[VoteDecision.REJECT]) {
      dispute.outcome = DisputeOutcome.UPHELD;
    } else if (voteCount[VoteDecision.UPHOLD] < voteCount[VoteDecision.REJECT]) {
      dispute.outcome = DisputeOutcome.REJECTED;
    } else {
      dispute.outcome = DisputeOutcome.TIED;
    }

    dispute.status = DisputeStatus.RESOLVED;
    await this.disputeRepository.save(dispute);

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