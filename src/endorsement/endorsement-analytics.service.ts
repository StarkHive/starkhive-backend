import { Injectable } from '@nestjs/common';
import { EndorsementRepository } from './repository/endorsement.repository';

@Injectable()
export class EndorsementAnalyticsService {
  constructor(private readonly endorsementRepo: EndorsementRepository) {}

  // fn to get total endorsements over time
  public async getTotalEndorsementsOverTime() {
    return this.endorsementRepo
      .createQueryBuilder('endorsement')
      .select("DATE_TRUNC('day', endorsement.createdAt)", 'date')
      .addSelect('COUNT(*)', 'total')
      .groupBy("DATE_TRUNC('day', endorsement.createdAt)")
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  // Get top-endorsed skills
  public async getTopEndorsedSkills(limit = 5) {
    return this.endorsementRepo
      .createQueryBuilder('endorsement')
      .select('endorsement.skill', 'skill')
      .addSelect('COUNT(*)', 'count')
      .groupBy('endorsement.skill')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  // fn  get most active endorsers
  public async getMostActiveEndorsers(limit = 5) {
    return this.endorsementRepo
      .createQueryBuilder('endorsement')
      .select('endorsement.endorserId', 'endorserId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('endorsement.endorserId')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
