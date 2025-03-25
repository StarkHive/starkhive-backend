import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Reputation } from './Reputation.entity';

@Injectable()
export class ReputationRepository extends Repository<Reputation> {
  constructor(private dataSource: DataSource) {
    super(Reputation, dataSource.createEntityManager());
  }

  // Get reputation by userId
  async getReputationByUserId(userId: number): Promise<Reputation | null> {
    return this.findOne({ where: { user: { id: userId.toString() } } });
  }

  // Update reputation when a job is completed
  async updateReputation(userId: number, rating: number): Promise<Reputation> {
    let reputation = await this.getReputationByUserId(userId);
    if (!reputation) {
      reputation = this.create({ user: { id: userId.toString() }, rating, completedJobs: 1 });
    } else {
      reputation.completedJobs += 1;
      reputation.rating = (reputation.rating + rating) / reputation.completedJobs;
    }
    return this.save(reputation);
  }

  // Verify a user
  async verifyUser(userId: number): Promise<Reputation> {
    const reputation = await this.getReputationByUserId(userId);
    if (reputation) {
      reputation.verificationStatus = true;
      return this.save(reputation);
    }
    throw new Error('User reputation not found');
  }
}
