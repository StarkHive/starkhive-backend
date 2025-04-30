import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalStatus } from './enums/proposal-status.enum';
import { UpdateProposalDto } from './dto/update-proposal-moderation.dto';
import { Proposal } from './entities/proposal-moderation.entity';

@Injectable()
export class ProposalModerationService {
  constructor(
    @InjectRepository(Proposal)
    private proposalRepo: Repository<Proposal>,
  ) {}

  findAll(status?: ProposalStatus) {
    return this.proposalRepo.find({ where: status ? { status } : {} });
  }

  async update(id: string, dto: UpdateProposalDto) {
    const proposal = await this.proposalRepo.findOne({ where: { id } });
    if (!proposal) throw new NotFoundException('Proposal not found');

    Object.assign(proposal, dto);
    return this.proposalRepo.save(proposal);
  }

  async delete(id: string) {
    const proposal = await this.proposalRepo.findOne({ where: { id } });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return this.proposalRepo.remove(proposal);
  }
}
