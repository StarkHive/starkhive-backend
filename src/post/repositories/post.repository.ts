import type { Repository } from "typeorm"
import { Post } from "../entities/post.entity"
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly repository: Repository<Post>,
  ) {}

  async findById(id: string): Promise<Post> {
    return this.repository.findOne({
      where: { id },
      relations: ["author", "images", "hashtags"],
    })
  }

  async create(post: Partial<Post>): Promise<Post> {
    const newPost = this.repository.create(post)
    return this.repository.save(newPost)
  }

  async update(id: string, post: Partial<Post>): Promise<Post> {
    await this.repository.update(id, post)
    return this.findById(id)
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id)
  }

  async incrementReactionCount(id: string): Promise<void> {
    await this.repository.increment({ id }, "reactionCount", 1)
  }

  async decrementReactionCount(id: string): Promise<void> {
    await this.repository.decrement({ id }, "reactionCount", 1)
  }

  async incrementRepostCount(id: string): Promise<void> {
    await this.repository.increment({ id }, "repostCount", 1)
  }

  async getActivityFeed(userId: string, connections: string[], skip = 0, take = 20): Promise<[Post[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .leftJoinAndSelect("post.images", "images")
      .leftJoinAndSelect("post.hashtags", "hashtags")
      .leftJoinAndSelect("post.originalPost", "originalPost")
      .leftJoinAndSelect("originalPost.author", "originalAuthor")
      .where(
        `
        (post.authorId = :userId) OR
        (post.authorId IN (:...connections) AND post.privacy = 'public') OR
        (post.authorId IN (:...connections) AND post.privacy = 'connections') OR
        (post.privacy = 'public')
      `,
        { userId, connections: connections.length ? connections : [null] },
      )
      .orderBy("post.createdAt", "DESC")
      .skip(skip)
      .take(take)

    return queryBuilder.getManyAndCount()
  }

  async getTrendingHashtags(limit = 10): Promise<
    {
      name: string
      count: string
    }[]
  > {
    const queryBuilder = this.repository
      .createQueryBuilder("post")
      .leftJoin("post.hashtags", "hashtag")
      .select("hashtag.name", "name")
      .addSelect("COUNT(post.id)", "count")
      .where("post.createdAt > :date", {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      })
      .groupBy("hashtag.name")
      .orderBy("count", "DESC")
      .limit(limit)

    return queryBuilder.getRawMany()
  }
}

