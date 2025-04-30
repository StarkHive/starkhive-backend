import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProofOfWorkDto } from './dto/create-proof-of-work.dto';
import { UpdateProofOfWorkDto } from './dto/update-proof-of-work.dto';
import { ProofOfWork, ProofOfWorkStatus } from './entities/proof-of-work.entity';

@Injectable()
export class ProofOfWorkService {
  constructor(
    @InjectRepository(ProofOfWork)
    private readonly proofOfWorkRepository: Repository<ProofOfWork>,
  ) {}

  async create(freelancerId: string, createProofOfWorkDto: CreateProofOfWorkDto): Promise<ProofOfWork> {
    const proofOfWork = this.proofOfWorkRepository.create({
      ...createProofOfWorkDto,
      freelancerId,
      status: ProofOfWorkStatus.PENDING,
    });

    return this.proofOfWorkRepository.save(proofOfWork);
  }

  async findAll(jobId?: string, freelancerId?: string): Promise<ProofOfWork[]> {
    const query = this.proofOfWorkRepository.createQueryBuilder('pow')
      .leftJoinAndSelect('pow.freelancer', 'freelancer');

    if (jobId) {
      query.andWhere('pow.jobId = :jobId', { jobId });
    }

    if (freelancerId) {
      query.andWhere('pow.freelancerId = :freelancerId', { freelancerId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<ProofOfWork> {
    const proofOfWork = await this.proofOfWorkRepository.findOne({
      where: { id },
      relations: ['freelancer'],
    });

    if (!proofOfWork) {
      throw new NotFoundException(`Proof of work #${id} not found`);
    }

    return proofOfWork;
  }

  async update(
    id: string,
    userId: string,
    isClient: boolean,
    updateProofOfWorkDto: UpdateProofOfWorkDto,
  ): Promise<ProofOfWork> {
    const proofOfWork = await this.findOne(id);

    // Only allow freelancer to update if status is pending
    if (!isClient && proofOfWork.freelancerId !== userId) {
      throw new ForbiddenException('You can only update your own submissions');
    }

    // Only allow client to update status and feedback
    if (isClient) {
      const allowedFields = ['status', 'clientFeedback'];
      const updateFields = Object.keys(updateProofOfWorkDto);
      const hasInvalidFields = updateFields.some(field => !allowedFields.includes(field));

      if (hasInvalidFields) {
        throw new ForbiddenException('Clients can only update status and feedback');
      }
    }

    Object.assign(proofOfWork, updateProofOfWorkDto);
    return this.proofOfWorkRepository.save(proofOfWork);
  }

  async remove(id: string, userId: string): Promise<void> {
    const proofOfWork = await this.findOne(id);

    if (proofOfWork.freelancerId !== userId) {
      throw new ForbiddenException('You can only delete your own submissions');
    }

    if (proofOfWork.status !== ProofOfWorkStatus.PENDING) {
      throw new ForbiddenException('You can only delete pending submissions');
    }

    await this.proofOfWorkRepository.remove(proofOfWork);
  }
}
