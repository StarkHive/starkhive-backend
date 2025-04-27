import { Injectable } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractRepository } from './repositories/contract.repository';

@Injectable()
export class ContractService {
  constructor(
    private readonly contractRepository: ContractRepository,
  ) {}

  create(createContractDto: CreateContractDto) {
    return 'This action adds a new contract';
  }

  findAll() {
    return `This action returns all contract`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contract`;
  }

  update(id: number, updateContractDto: UpdateContractDto) {
    return `This action updates a #${id} contract`;
  }

  remove(id: number) {
    return `This action removes a #${id} contract`;
  }

  async findByUserId(userId: string, isCompleted?: boolean) {
    return this.contractRepository.findByUserId(userId, isCompleted);
  }
}

