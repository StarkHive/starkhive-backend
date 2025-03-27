import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Endorsement } from '../entities/endorsement.entity';

@Injectable()
export class EndorsementRepository extends Repository<Endorsement> {
  constructor(private readonly dataSource: DataSource) {
    super(Endorsement, dataSource.createEntityManager());
  }

  // Find endorsements for a specific profile with sorting options
  public async findByProfileWithSorting( 
    profileId: number,
    sortBy: 'skill' | 'count' | 'date',
    order: 'ASC' | 'DESC',
  ) {
    const query = this.createQueryBuilder('endorsement')
      .leftJoinAndSelect('endorsement.endorser', 'endorser')
      .leftJoinAndSelect('endorsement.endorsedProfile', 'endorsedProfile')
      .where('endorsedProfile.id = :profileId', { profileId });

    // Handle sorting logic
    switch (sortBy) {
      case 'skill':
        query.orderBy('endorsement.skill', order);
        break;
      case 'count':
        query
          .addSelect('COUNT(endorsement.skill)', 'endorsementCount')
          .groupBy('endorsement.skill')
          .orderBy('endorsementCount', order);
        break;
      case 'date':
        query.orderBy('endorsement.createdAt', order);
        break;
      default:
        query.orderBy('endorsement.createdAt', 'DESC');
        break;
    }

    return query.getMany();
  }

  // Count endorsements for a specific profile
  public async countEndorsementsForProfile(profileId: number) {
    return this.createQueryBuilder('endorsement')
      .where('endorsement.endorsedProfile.id = :profileId', { profileId })
      .getCount();
  }

  // Save endorsement
  public async saveEndorsement(endorsement: Endorsement) {
    return this.save(endorsement);
  }
}
