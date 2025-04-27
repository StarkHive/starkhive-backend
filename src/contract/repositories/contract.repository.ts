import { EntityRepository, Repository } from 'typeorm';
import { Contract } from '../entities/contract.entity';

@EntityRepository(Contract)
export class ContractRepository extends Repository<Contract> {
    async findByUserId(userId: string, isCompleted?: boolean) {
        const query = this.createQueryBuilder('contract')
            .leftJoinAndSelect('contract.user', 'user')
            .where('user.id = :userId', { userId });
        if (typeof isCompleted === 'boolean') {
            query.andWhere('contract.isCompleted = :isCompleted', { isCompleted });
        }
        return query.getMany();
    }
}