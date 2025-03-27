import type { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly repository: Repository<Post>,
  ) {}

  // Direct pass-through methods to match TypeORM Repository methods
  findOne(options: any) {
    return this.repository.findOne(options);
  }

  create(data: Partial<Post>) {
    return this.repository.create(data);
  }

  save(post: Post | Partial<Post>) {
    return this.repository.save(post);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }

  increment(options: any, columnName: string, value: number) {
    return this.repository.increment(options, columnName, value);
  }

  // Methods that were previously in the repository
  async findById(id: string): Promise<Post | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['author', 'images', 'hashtags'],
    });
  }

  async update(id: string, post: Partial<Post>): Promise<Post | null> {
    await this.repository.update(id, post);
    return this.findById(id);
  }

  async incrementReactionCount(id: string): Promise<void> {
    await this.repository.increment({ id }, 'reactionCount', 1);
  }

  async decrementReactionCount(id: string): Promise<void> {
    await this.repository.decrement({ id }, 'reactionCount', 1);
  }

  async incrementRepostCount(id: string): Promise<void> {
    await this.repository.increment({ id }, 'repostCount', 1);
  }

  async getActivityFeed(
    userId: string,
    connections: string[],
    skip = 0,
    take = 20,
  ): Promise<[Post[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.images', 'images')
      .leftJoinAndSelect('post.hashtags', 'hashtags')
      .leftJoinAndSelect('post.originalPost', 'originalPost')
      .leftJoinAndSelect('originalPost.author', 'originalAuthor')
      .where(
        `
        (post.authorId = :userId) OR
        (post.authorId IN (:...connections) AND post.privacy = 'public') OR
        (post.authorId IN (:...connections) AND post.privacy = 'connections') OR
        (post.privacy = 'public')
      `,
        { userId, connections: connections.length ? connections : [null] },
      )
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    return queryBuilder.getManyAndCount();
  }

  // Additional utility methods from previous implementation
  async getTrendingHashtags(limit = 10): Promise<
    {
      name: string;
      count: string;
    }[]
  > {
    const queryBuilder = this.repository
      .createQueryBuilder('post')
      .leftJoin('post.hashtags', 'hashtag')
      .select('hashtag.name', 'name')
      .addSelect('COUNT(post.id)', 'count')
      .where('post.createdAt > :date', {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      })
      .groupBy('hashtag.name')
      .orderBy('count', 'DESC')
      .limit(limit);

    return queryBuilder.getRawMany();
  }

  async findOrCreate(
    conditions: Partial<Post>,
    createData: Partial<Post>,
  ): Promise<Post> {
    let post = await this.repository.findOne({
      where: conditions,
    });

    if (!post) {
      post = this.repository.create(createData);
      return this.repository.save(post);
    }

    return post;
  }
}
