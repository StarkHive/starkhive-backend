import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { PostReaction } from "./entities/post-reaction.entity"
import { PostImage } from "./entities/post-image.entity"
import type { UserService } from "src/user/user.service"
import type { CreateReactionDto } from "./dto/create-reaction.dto"
import type { CreatePostDto } from "./dto/create-post.dto"
import type { UpdatePostDto } from "./dto/update-post.dto"
import { PostRepository } from "./repositories/post.repository"
import { HashtagRepository } from "./repositories/hashtag.repository"
import { type Post, PostPrivacy } from "./entities/post.entity"

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly hashtagRepository: HashtagRepository,
    private readonly usersService: UserService,
    @InjectRepository(PostImage)
    private readonly postImageRepository: Repository<PostImage>,
    @InjectRepository(PostReaction)
    private readonly postReactionRepository: Repository<PostReaction>,
  ) {}

  async createPost(userId: string, createPostDto: CreatePostDto): Promise<Post> {
    // Extract hashtags from content
    const extractedHashtags = this.extractHashtags(createPostDto.content)
    const allHashtags = [...new Set([...(createPostDto.hashtags || []), ...extractedHashtags])]

    // Get or create hashtags
    const hashtags = await this.hashtagRepository.findOrCreate(allHashtags)

    // Extract metadata
    const metadata = {
      links: createPostDto.links || [],
      mentions: this.extractMentions(createPostDto.content),
    }

    // Check if repost
    let originalPost = null
    if (createPostDto.originalPostId) {
      originalPost = await this.postRepository.findById(createPostDto.originalPostId)
      if (!originalPost) {
        throw new NotFoundException("Original post not found")
      }

      // Verify post visibility
      if (originalPost.privacy === PostPrivacy.PRIVATE) {
        throw new ForbiddenException("Cannot repost a private post")
      }

      if (originalPost.privacy === PostPrivacy.CONNECTIONS) {
        const connections:any = await this.usersService.getUserConnections(userId)
        if (originalPost.authorId !== userId && !connections.includes(originalPost.authorId)) {
          throw new ForbiddenException("Cannot repost this post")
        }
      }

      // Increment repost count on original post
      await this.postRepository.incrementRepostCount(originalPost.id)
    }

    // Create post
    const post = await this.postRepository.create({
      content: createPostDto.content,
      privacy: createPostDto.privacy,
      authorId: userId,
      hashtags,
      originalPostId: createPostDto.originalPostId,
    })

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
      )

      await this.postImageRepository.save(images)
      post.images = images
    }

    return post
  }

  async updatePost(userId: string, postId: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.postRepository.findById(postId)

    if (!post) {
      throw new NotFoundException("Post not found")
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException("You can only edit your own posts")
    }

    if (post.originalPostId) {
      throw new BadRequestException("Reposts cannot be edited")
    }

    const updates: Partial<Post> = {}

    if (updatePostDto.content) {
      updates.content = updatePostDto.content

      // Update hashtags if content changed
      const extractedHashtags = this.extractHashtags(updatePostDto.content)
      const allHashtags = [...new Set([...(updatePostDto.hashtags || []), ...extractedHashtags])]
      const hashtags = await this.hashtagRepository.findOrCreate(allHashtags)
      updates.hashtags = hashtags

      // Update metadata
      updates.metadata = {
        links:  post.metadata.links || [],
        mentions: this.extractMentions(updatePostDto.content),
      }
    }

    if (updatePostDto.privacy) {
      updates.privacy = updatePostDto.privacy
    }

    // Update post
    const updatedPost = await this.postRepository.update(postId, updates)

    // Handle image updates
    if (updatePostDto.images) {
      // Delete existing images
      await this.postImageRepository.delete({ postId })

      // Create new images
      const images = updatePostDto.images.map((image, index) =>
        this.postImageRepository.create({
          url: image.url,
          caption: image.caption,
          altText: image.altText,
          order: image.order || index,
          postId,
        }),
      )

      if (images.length > 0) {
        await this.postImageRepository.save(images)
        updatedPost.images = images
      }
    }

    return updatedPost
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    const post = await this.postRepository.findById(postId)

    if (!post) {
      throw new NotFoundException("Post not found")
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException("You can only delete your own posts")
    }

    // If this is a repost, decrement count on original post
    if (post.originalPostId) {
      await this.postRepository.decrementReactionCount(post.originalPostId)
    }

    await this.postRepository.delete(postId)
  }

  async getPost(userId: string, postId: string): Promise<Post> {
    const post = await this.postRepository.findById(postId)

    if (!post) {
      throw new NotFoundException("Post not found")
    }

    // Check permissions based on privacy settings
    if (post.privacy === PostPrivacy.PRIVATE && post.authorId !== userId) {
      throw new ForbiddenException("You do not have permission to view this post")
    }

    if (post.privacy === PostPrivacy.CONNECTIONS && post.authorId !== userId) {
      const connections:any = await this.usersService.getUserConnections(userId)
      if (!connections.includes(post.authorId)) {
        throw new ForbiddenException("You do not have permission to view this post")
      }
    }

    return post
  }

  async getActivityFeed(userId: string, page = 1, limit = 20): Promise<{ posts: Post[]; total: number }> {
    const connections:any = await this.usersService.getUserConnections(userId)
    const skip = (page - 1) * limit

    const [posts, total] = await this.postRepository.getActivityFeed(userId, connections, skip, limit)

    return { posts, total }
  }

  async reactToPost(userId: string, postId: string, reactionDto: CreateReactionDto): Promise<PostReaction> {
    const post = await this.postRepository.findById(postId)

    if (!post) {
      throw new NotFoundException("Post not found")
    }

    // Check visibility permissions
    if (post.privacy === PostPrivacy.PRIVATE && post.authorId !== userId) {
      throw new ForbiddenException("You do not have permission to react to this post")
    }

    if (post.privacy === PostPrivacy.CONNECTIONS && post.authorId !== userId) {
      const connections:any = await this.usersService.getUserConnections(userId)
      if (!connections.includes(post.authorId)) {
        throw new ForbiddenException("You do not have permission to react to this post")
      }
    }

    // Check if user already reacted with the same type
    const existingReaction = await this.postReactionRepository.findOne({
      where: {
        postId,
        userId,
        type: reactionDto.type,
      },
    })

    if (existingReaction) {
      // Remove the reaction (toggle)
      await this.postReactionRepository.remove(existingReaction)
      await this.postRepository.decrementReactionCount(postId)
      return null
    }

    // Check if user already reacted with a different type
    const otherReaction = await this.postReactionRepository.findOne({
      where: {
        postId,
        userId,
      },
    })

    if (otherReaction) {
      // Change the reaction type
      otherReaction.type = reactionDto.type
      return this.postReactionRepository.save(otherReaction)
    }

    // Create a new reaction
    const reaction = this.postReactionRepository.create({
      postId,
      userId,
      type: reactionDto.type,
    })

    await this.postRepository.incrementReactionCount(postId)
    return this.postReactionRepository.save(reaction)
  }

  async getTrendingHashtags(limit = 10): Promise<any[]> {
    return this.hashtagRepository.getTrending(limit)
  }

  private extractHashtags(content: string): string[] {
    // Match hashtag pattern: #word
    const hashtagRegex = /#(\w+)/g
    const matches = content.match(hashtagRegex) || []

    // Remove the # prefix and return unique values
    return [...new Set(matches.map((tag) => tag.substring(1).toLowerCase()))]
  }

  private extractMentions(content: string): string[] {
    // Match mention pattern: @username
    const mentionRegex = /@(\w+)/g
    const matches = content.match(mentionRegex) || []

    // Remove the @ prefix and return unique values
    return [...new Set(matches.map((mention) => mention.substring(1).toLowerCase()))]
  }
}

