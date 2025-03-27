import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hashtag } from '../entities/hashtag.entity';

@Injectable()
export class HashtagRepository {
  constructor(
    @InjectRepository(Hashtag)
    private readonly repository: Repository<Hashtag>,
  ) {}

  findOne(options: any) {
    return this.repository.findOne(options);
  }

  create(data: Partial<Hashtag>) {
    return this.repository.create(data);
  }

  save(hashtag: Hashtag | Partial<Hashtag>) {
    return this.repository.save(hashtag);
  }

  // Add any additional custom methods as needed
}
