import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PostReaction } from './entities/post-reaction.entity';
import type { UserService } from 'src/user/user.service';
import type { CreateReactionDto } from './dto/create-reaction.dto';
import type { CreatePostDto } from './dto/create-post.dto';
import type { UpdatePostDto } from './dto/update-post.dto';
import { PostRepository } from './repositories/post.repository';
import { type Post, PostPrivacy } from './entities/post.entity';
import { PostReactionRepository } from './repositories/post-reaction.repository';
import { PostImageRepository } from './repositories/post-image.repository';
import { HashtagRepository } from './repositories/hashtag.repository';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postImageRepository: PostImageRepository,
    private readonly postReactionRepository: PostReactionRepository,
    private readonly hashtagRepository: HashtagRepository,
    private readonly usersService: UserService,
  ) {}

  async createPost(
    userId: string,
    createPostDto: CreatePostDto,
  ): Promise<Post> {
    // Extract hashtags from content
    const extracteds = this.extractHashtags(createPostDto.content);
    const alls = [
      ...new Set([...(createPostDto.hashtags || []), ...extracteds]),
    ];

    // Get or create hashtags
    const hashtags = [];
    for (const tag of alls) {
      let tagRecord = await this.hashtagRepository.findOne({
        where: { name: tag },
      });
      if (!tagRecord) {
        tagRecord = this.hashtagRepository.create({ name: tag });
        await this.hashtagRepository.save(tagRecord);
      }
      hashtags.push(tagRecord);
    }

    // Check if repost
    let originalPost = null;
    if (createPostDto.originalPostId) {
      originalPost = await this.postRepository.findOne({
        where: { id: createPostDto.originalPostId },
      });
      if (!originalPost) {
        throw new NotFoundException('Original post not found');
      }

      // Verify post visibility
      if (originalPost.privacy === PostPrivacy.PRIVATE) {
        throw new ForbiddenException('Cannot repost a private post');
      }

      if (originalPost.privacy === PostPrivacy.CONNECTIONS) {
        const connections: any =
          await this.usersService.getUserConnections(userId);
        if (
          originalPost.authorId !== userId &&
          !connections.includes(originalPost.authorId)
        ) {
          throw new ForbiddenException('Cannot repost this post');
        }
      }

      // Increment repost count on original post
      await this.postRepository.increment(
        { id: originalPost.id },
        'repostCount',
        1,
      );
    }

    // Create post
    const postToSave = this.postRepository.create({
      content: createPostDto.content,
      privacy: createPostDto.privacy,
      authorId: userId,
      hashtags,
      originalPostId: createPostDto.originalPostId,
    });

    const post = await this.postRepository.save(postToSave);

    // Create post images
    if (createPostDto.images && createPostDto.images.length > 0) {
      const images = createPostDto.images.map((image, index) =>
        this.postImageRepository.create({
          url: image.url,
          caption: image.caption,
          altText: image.altText,
          order: image.order || index,
          postId: post.id,
        }),
      );

      await this.postImageRepository.save(images);
      post.images = images;
    }

    return post;
  }

  async updatePost(
    userId: string,
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['hashtags', 'images'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    if (post.originalPostId) {
      throw new BadRequestException('Reposts cannot be edited');
    }

    // Apply updates
    if (updatePostDto.content) {
      post.content = updatePostDto.content;

      // Update hashtags
      const extracteds = this.extractHashtags(updatePostDto.content);
      const alls = [
        ...new Set([...(updatePostDto.hashtags || []), ...extracteds]),
      ];
      post.hashtags = [];
      for (const tag of alls) {
        let tagRecord = await this.hashtagRepository.findOne({
          where: { name: tag },
        });
        if (!tagRecord) {
          tagRecord = this.hashtagRepository.create({ name: tag });
          await this.hashtagRepository.save(tagRecord);
        }
        post.hashtags.push(tagRecord);
      }

      // Update metadata
      post.metadata = {
        links: post.metadata?.links || [],
        mentions: this.extractMentions(updatePostDto.content),
      };
    }

    if (updatePostDto.privacy) {
      post.privacy = updatePostDto.privacy;
    }

    // Save updated post
    const updatedPost = await this.postRepository.save(post);

    // Handle image updates
    if (updatePostDto.images) {
      // Delete existing images
      await this.postImageRepository.delete({ postId });

      // Create new images
      const images = updatePostDto.images.map((image, index) =>
        this.postImageRepository.create({
          url: image.url,
          caption: image.caption,
          altText: image.altText,
          order: image.order || index,
          postId,
        }),
      );

      if (images.length > 0) {
        await this.postImageRepository.save(images);
        updatedPost.images = images;
      }
    }

    return updatedPost;
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    // If this is a repost, decrement count on original post
    if (post.originalPostId) {
      await this.postRepository.decrementReactionCount(post.originalPostId);
    }

    await this.postRepository.delete(postId);
  }

  async getPost(userId: string, postId: string): Promise<Post> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check permissions based on privacy settings
    if (post.privacy === PostPrivacy.PRIVATE && post.authorId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this post',
      );
    }

    if (post.privacy === PostPrivacy.CONNECTIONS && post.authorId !== userId) {
      const connections: any =
        await this.usersService.getUserConnections(userId);
      if (!connections.includes(post.authorId)) {
        throw new ForbiddenException(
          'You do not have permission to view this post',
        );
      }
    }

    return post;
  }

  async getActivityFeed(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ posts: Post[]; total: number }> {
    const connections: any = await this.usersService.getUserConnections(userId);
    const skip = (page - 1) * limit;

    const [posts, total] = await this.postRepository.getActivityFeed(
      userId,
      connections,
      skip,
      limit,
    );

    return { posts, total };
  }

  async reactToPost(
    userId: string,
    postId: string,
    reactionDto: CreateReactionDto,
  ): Promise<PostReaction | null> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check visibility permissions
    if (post.privacy === PostPrivacy.PRIVATE && post.authorId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to react to this post',
      );
    }

    if (post.privacy === PostPrivacy.CONNECTIONS && post.authorId !== userId) {
      const connections: any =
        await this.usersService.getUserConnections(userId);
      if (!connections.includes(post.authorId)) {
        throw new ForbiddenException(
          'You do not have permission to react to this post',
        );
      }
    }

    // Check if user already reacted with the same type
    const existingReaction = await this.postReactionRepository.findOne({
      where: {
        postId,
        userId,
        type: reactionDto.type,
      },
    });

    if (existingReaction) {
      // Remove the reaction (toggle)
      await this.postReactionRepository.remove(existingReaction);
      await this.postRepository.decrementReactionCount(postId);
      return null;
    }

    // Check if user already reacted with a different type
    const otherReaction = await this.postReactionRepository.findOne({
      where: {
        postId,
        userId,
      },
    });

    if (otherReaction) {
      // Change the reaction type
      otherReaction.type = reactionDto.type;
      return this.postReactionRepository.save(otherReaction);
    }

    // Create new reaction
    const reaction = this.postReactionRepository.create({
      userId,
      postId,
      type: reactionDto.type,
    });

    await this.postReactionRepository.save(reaction);
    await this.postRepository.incrementReactionCount(postId);

    return reaction;
  }

  private extractHashtags(content: string): string[] {
    const regex = /#[a-zA-Z0-9_]+/g;
    return (content.match(regex) || []).map((hashtag) => hashtag.slice(1));
  }

  private extractMentions(content: string): string[] {
    const regex = /@[a-zA-Z0-9_]+/g;
    return (content.match(regex) || []).map((mention) => mention.slice(1));
  }
}
