import { EntityRepository, Repository } from 'typeorm';
import { Contract } from '../entities/contract.entity';

@EntityRepository(Contract)
export class ContractRepository extends Repository<Contract> {}