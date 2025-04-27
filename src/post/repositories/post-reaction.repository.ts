import { EntityRepository, Repository, EntityManager } from 'typeorm';
import { PostReaction } from '../entities/post-reaction.entity';
import { Injectable } from '@nestjs/common';
import { ReactionType } from '../entities/post-reaction.entity';
import { UserRepository } from '@src/user/repositories/user.repositories';

@Injectable()
@EntityRepository(PostReaction)
export class PostReactionRepository extends Repository<PostReaction> {
  constructor(
    private readonly userRepository: UserRepository, // Inject the UserRepository
    private readonly entityManager: EntityManager, // Inject the EntityManager
  ) {
    super(PostReaction, entityManager); // Pass PostReaction and the entityManager directly
  }

  // Get reactions by postId
  async getReactionsByPostId(postId: string): Promise<PostReaction[]> {
    return this.find({ where: { postId } });
  }

  // Get user's reaction for a specific post
  async getUserReaction(
    postId: string,
    userId: string,
  ): Promise<PostReaction | null> {
    return this.findOne({ where: { postId, userId } });
  }

  // Add a reaction
  async addReaction(
    userId: string,
    postId: string,
    type: ReactionType,
  ): Promise<PostReaction> {
    const post = await this.findOne({ where: { postId } });
    const user = await this.userRepository.findOneById(userId); // Correct method to use userRepository

    if (!post || !user) {
      throw new Error('Post or user not found');
    }

    const reaction = this.create({
      postId,
      userId,
      type,
      post,
      user,
    });

    return this.save(reaction);
  }

  // Remove a reaction
  async removeReaction(
    postId: string,
    userId: string,
    type: ReactionType,
  ): Promise<void> {
    await this.delete({ postId, userId, type });
  }
}
