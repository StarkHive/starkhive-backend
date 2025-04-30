import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThan } from 'typeorm';
import { JobTag } from './entities/job-tag.entity';
import { TagVote } from './entities/tag-vote.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { VoteTagDto } from './dto/vote-tag.dto';
import { VoteType } from './enums/voteType.enum';

@Injectable()
export class JobTagsService {
  constructor(
    @InjectRepository(JobTag)
    private jobTagRepository: Repository<JobTag>,
    @InjectRepository(TagVote)
    private tagVoteRepository: Repository<TagVote>,
    private dataSource: DataSource,
  ) {}

  /**
   * Submit a new tag for a job
   */
  async submitTag(createTagDto: CreateTagDto, userId: string): Promise<JobTag> {
    // Check if a similar tag already exists for this job
    const existingTag = await this.jobTagRepository.findOne({
      where: {
        name: createTagDto.name.trim().toLowerCase(),
        jobId: createTagDto.jobId,
      },
    });

    if (existingTag) {
      throw new ConflictException('A similar tag already exists for this job');
    }

    // Create the new tag
    const newTag = this.jobTagRepository.create({
      name: createTagDto.name.trim().toLowerCase(),
      description: createTagDto.description,
      jobId: createTagDto.jobId,
      createdById: userId,
      confidenceScore: 0, // Initial confidence score
    });

    return this.jobTagRepository.save(newTag);
  }

  /**
   * Vote on an existing tag
   */
  async voteOnTag(
    tagId: string,
    voteTagDto: VoteTagDto,
    userId: string,
  ): Promise<JobTag> {
    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get the tag
      const tag = await this.jobTagRepository.findOne({
        where: { id: tagId },
      });

      if (!tag) {
        throw new NotFoundException('Tag not found');
      }

      // Check if user has already voted on this tag
      const existingVote = await this.tagVoteRepository.findOne({
        where: {
          tagId,
          userId,
        },
      });

      // Handle the vote
      if (existingVote) {
        // User is changing their vote
        if (existingVote.voteType !== voteTagDto.voteType) {
          // Update vote counts based on the change
          if (voteTagDto.voteType === VoteType.UPVOTE) {
            tag.upvotes += 1;
            tag.downvotes -= 1;
          } else {
            tag.upvotes -= 1;
            tag.downvotes += 1;
          }

          // Update the vote record
          existingVote.voteType = voteTagDto.voteType;
          await queryRunner.manager.save(existingVote);
        } else {
          // User is trying to vote the same way again - remove their vote
          if (voteTagDto.voteType === VoteType.UPVOTE) {
            tag.upvotes -= 1;
          } else {
            tag.downvotes -= 1;
          }

          await queryRunner.manager.remove(existingVote);
        }
      } else {
        // New vote
        const newVote = this.tagVoteRepository.create({
          tagId,
          userId,
          voteType: voteTagDto.voteType,
        });

        // Update vote counts
        if (voteTagDto.voteType === VoteType.UPVOTE) {
          tag.upvotes += 1;
        } else {
          tag.downvotes += 1;
        }

        await queryRunner.manager.save(newVote);
      }

      // Recalculate confidence score using Wilson score interval
      tag.confidenceScore = this.calculateWilsonScore(
        tag.upvotes,
        tag.downvotes,
      );

      // Save the updated tag
      const updatedTag = await queryRunner.manager.save(tag);

      // Commit the transaction
      await queryRunner.commitTransaction();

      return updatedTag;
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  /**
   * Calculate Wilson score interval for confidence
   * This gives a lower bound of the confidence interval for a binomial parameter
   */
  private calculateWilsonScore(upvotes: number, downvotes: number): number {
    const n = upvotes + downvotes;

    if (n === 0) return 0;

    const z = 1.96; // 95% confidence
    const p = upvotes / n;

    // Wilson score interval
    const numerator =
      p +
      (z * z) / (2 * n) -
      z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
    const denominator = 1 + (z * z) / n;

    return numerator / denominator;
  }

  /**
   * Get all tags for a specific job
   */
  async getTagsForJob(jobId: string): Promise<JobTag[]> {
    return this.jobTagRepository.find({
      where: { jobId },
      order: { confidenceScore: 'DESC' },
    });
  }

  /**
   * Check if a user has reached their daily vote limit
   * Limit is set to 100 votes per day
   */
  async checkUserVoteLimit(userId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const voteCount = await this.tagVoteRepository.count({
      where: {
        userId,
        createdAt: MoreThan(today),
      },
    });

    return voteCount >= 100; // Limit to 100 votes per day
  }

  /**
   * Find similar tags to prevent duplicates
   * This is a simple implementation - could be enhanced with more sophisticated
   * string similarity algorithms
   */
  async findSimilarTags(jobId: string, tagName: string): Promise<JobTag[]> {
    const normalizedName = tagName.trim().toLowerCase();

    return this.jobTagRepository.find({
      where: {
        jobId,
        name: normalizedName,
      },
    });
  }
}
