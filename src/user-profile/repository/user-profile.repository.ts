import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';

@Injectable()
export class UserProfileRepository extends Repository<UserProfile> {
  constructor(private readonly dataSource: DataSource) {
    super(UserProfile, dataSource.createEntityManager());
  }

  public async findById(id: number): Promise<UserProfile | null> {
    return this.findOne({ where: { id } });
  }
}
