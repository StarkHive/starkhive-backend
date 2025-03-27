import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { PostService } from './post.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PostReaction, ReactionType } from './entities/post-reaction.entity';
import { PostRepository } from './repositories/post.repository';
import { HashtagRepository } from './repositories/hashtag.repository';
import { UserService } from 'src/user/user.service';
import { PostImage } from './entities/post-image.entity';
import { PostPrivacy } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';

// Mock repositories and services
const mockPostRepository = () => ({
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  incrementReactionCount: jest.fn(),
  decrementReactionCount: jest.fn(),
  incrementRepostCount: jest.fn(),
  getActivityFeed: jest.fn(),
});

const mockHashtagRepository = () => ({
  findOrCreate: jest.fn(),
  getTrending: jest.fn(),
});

const mockUserService = () => ({
  getUserConnections: jest.fn(),
});

const mockPostImageRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockPostReactionRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('PostService', () => {
  let service: PostService;
  let postRepository;
  let hashtagRepository;
  let userService;
  let postImageRepository;
  let postReactionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PostRepository,
          useFactory: mockPostRepository,
        },
        {
          provide: HashtagRepository,
          useFactory: mockHashtagRepository,
        },
        {
          provide: UserService,
          useFactory: mockUserService,
        },
        {
          provide: getRepositoryToken(PostImage),
          useFactory: mockPostImageRepository,
        },
        {
          provide: getRepositoryToken(PostReaction),
          useFactory: mockPostReactionRepository,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    postRepository = module.get<PostRepository>(PostRepository);
    hashtagRepository = module.get<HashtagRepository>(HashtagRepository);
    userService = module.get<UserService>(UserService);
    postImageRepository = module.get<Repository<PostImage>>(
      getRepositoryToken(PostImage),
    );
    postReactionRepository = module.get<Repository<PostReaction>>(
      getRepositoryToken(PostReaction),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const createPostDto: CreatePostDto = {
        content: 'Test post with #hashtag',
        privacy: PostPrivacy.PUBLIC,
        images: [
          {
            url: 'https://example.com/image.jpg',
            caption: 'Test image',
            altText: 'A test image',
          },
        ],
      };

      const extractedHashtags = ['hashtag'];
      const hashtags = [{ id: 'hashtag-1', name: 'hashtag' }];
      const newPost = {
        id: 'post-123',
        content: createPostDto.content,
        privacy: createPostDto.privacy,
        authorId: userId,
        metadata: {
          links: [],
          mentions: [],
        },
        hashtags,
      };
      const savedImage = {
        id: 'image-1',
        url: createPostDto.images[0].url,
        caption: createPostDto.images[0].caption,
        altText: createPostDto.images[0].altText,
        order: 0,
        postId: newPost.id,
      };

      // Mock implementations
      hashtagRepository.findOrCreate.mockResolvedValue(hashtags);
      postRepository.create.mockResolvedValue(newPost);
      postImageRepository.create.mockReturnValue(savedImage);
      postImageRepository.save.mockResolvedValue([savedImage]);

      // Act
      const result = await service.createPost(userId, createPostDto);

      // Assert
      expect(hashtagRepository.findOrCreate).toHaveBeenCalledWith(
        extractedHashtags,
      );
      expect(postRepository.create).toHaveBeenCalledWith({
        content: createPostDto.content,
        privacy: createPostDto.privacy,
        authorId: userId,
        metadata: {
          links: [],
          mentions: [],
        },
        hashtags,
        originalPostId: undefined,
      });
      expect(postImageRepository.create).toHaveBeenCalledWith({
        url: createPostDto.images[0].url,
        caption: createPostDto.images[0].caption,
        altText: createPostDto.images[0].altText,
        order: 0,
        postId: newPost.id,
      });
      expect(postImageRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ ...newPost, images: [savedImage] });
    });

    it('should create a repost successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const originalPostId = 'original-post-123';
      const createPostDto: CreatePostDto = {
        content: 'Reposting this',
        privacy: PostPrivacy.PUBLIC,
        originalPostId,
      };

      const originalPost = {
        id: originalPostId,
        content: 'Original post',
        privacy: PostPrivacy.PUBLIC,
        authorId: 'other-user-456',
      };

      const newPost = {
        id: 'post-123',
        content: createPostDto.content,
        privacy: createPostDto.privacy,
        authorId: userId,
        metadata: {
          links: [],
          mentions: [],
        },
        hashtags: [],
        originalPostId,
      };

      // Mock implementations
      postRepository.findById.mockResolvedValue(originalPost);
      hashtagRepository.findOrCreate.mockResolvedValue([]);
      postRepository.create.mockResolvedValue(newPost);
      userService.getUserConnections.mockResolvedValue([]);

      // Act
      const result = await service.createPost(userId, createPostDto);

      // Assert
      expect(postRepository.findById).toHaveBeenCalledWith(originalPostId);
      expect(postRepository.incrementRepostCount).toHaveBeenCalledWith(
        originalPostId,
      );
      expect(postRepository.create).toHaveBeenCalledWith({
        content: createPostDto.content,
        privacy: createPostDto.privacy,
        authorId: userId,
        metadata: {
          links: [],
          mentions: [],
        },
        hashtags: [],
        originalPostId,
      });
      expect(result).toEqual(newPost);
    });

    it('should throw NotFoundException when original post not found for repost', async () => {
      // Arrange
      const userId = 'user-123';
      const originalPostId = 'non-existent-post';
      const createPostDto: CreatePostDto = {
        content: 'Reposting this',
        privacy: PostPrivacy.PUBLIC,
        originalPostId,
      };

      // Mock implementations
      postRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createPost(userId, createPostDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(postRepository.findById).toHaveBeenCalledWith(originalPostId);
    });

    it('should throw ForbiddenException when trying to repost a private post', async () => {
      // Arrange
      const userId = 'user-123';
      const originalPostId = 'private-post-123';
      const createPostDto: CreatePostDto = {
        content: 'Reposting this',
        privacy: PostPrivacy.PUBLIC,
        originalPostId,
      };

      const originalPost = {
        id: originalPostId,
        content: 'Original post',
        privacy: PostPrivacy.PRIVATE,
        authorId: 'other-user-456',
      };

      // Mock implementations
      postRepository.findById.mockResolvedValue(originalPost);

      // Act & Assert
      await expect(service.createPost(userId, createPostDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updatePost', () => {
    it('should update a post successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const postId = 'post-123';
      const updatePostDto = {
        content: 'Updated content with #newhashtag',
        privacy: PostPrivacy.CONNECTIONS,
      };

      const existingPost = {
        id: postId,
        content: 'Original content',
        privacy: PostPrivacy.PUBLIC,
        authorId: userId,
        metadata: {
          links: [],
          mentions: [],
        },
        originalPostId: null,
      };

      const extractedHashtags = ['newhashtag'];
      const hashtags = [{ id: 'hashtag-2', name: 'newhashtag' }];
      const updatedPost = {
        ...existingPost,
        content: updatePostDto.content,
        privacy: updatePostDto.privacy,
        hashtags,
        metadata: {
          links: [],
          mentions: [],
        },
      };

      // Mock implementations
      postRepository.findById.mockResolvedValue(existingPost);
      hashtagRepository.findOrCreate.mockResolvedValue(hashtags);
      postRepository.update.mockResolvedValue(updatedPost);

      // Act
      const result = await service.updatePost(userId, postId, updatePostDto);

      // Assert
      expect(postRepository.findById).toHaveBeenCalledWith(postId);
      expect(hashtagRepository.findOrCreate).toHaveBeenCalledWith(
        extractedHashtags,
      );
      expect(postRepository.update).toHaveBeenCalledWith(postId, {
        content: updatePostDto.content,
        hashtags,
        metadata: {
          links: [],
          mentions: [],
        },
        privacy: updatePostDto.privacy,
      });
      expect(result).toEqual(updatedPost);
    });

    it('should throw NotFoundException when post not found', async () => {
      // Arrange
      const userId = 'user-123';
      const postId = 'non-existent-post';
      const updatePostDto = {
        content: 'Updated content',
      };

      // Mock implementations
      postRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updatePost(userId, postId, updatePostDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      // Arrange
      const userId = 'user-123';
      const postId = 'post-456';
      const updatePostDto = {
        content: 'Updated content',
      };

      const existingPost = {
        id: postId,
        content: 'Original content',
        authorId: 'other-user-456',
      };

      // Mock implementations
      postRepository.findById.mockResolvedValue(existingPost);

      // Act & Assert
      await expect(
        service.updatePost(userId, postId, updatePostDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when trying to edit a repost', async () => {
      // Arrange
      const userId = 'user-123';
      const postId = 'repost-123';
      const updatePostDto = {
        content: 'Updated content',
      };

      const existingPost = {
        id: postId,
        content: 'Original content',
        authorId: userId,
        originalPostId: 'original-post-789',
      };

      // Mock implementations
      postRepository.findById.mockResolvedValue(existingPost);

      // Act & Assert
      await expect(
        service.updatePost(userId, postId, updatePostDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reactToPost', () => {
    it('should add a new reaction to a post', async () => {
      // Arrange
      const userId = 'user-123';
      const postId = 'post-123';
      const reactionDto = {
        type: ReactionType.LIKE,
      };

      const post = {
        id: postId,
        content: 'Test post',
        privacy: PostPrivacy.PUBLIC,
        authorId: 'other-user-456',
      };

      const newReaction = {
        id: 'reaction-123',
        postId,
        userId,
        type: reactionDto.type,
      };

      // Mock implementations
      postRepository.findById.mockResolvedValue(post);
      postReactionRepository.findOne.mockResolvedValue(null);
      postReactionRepository.create.mockReturnValue(newReaction);
      postReactionRepository.save.mockResolvedValue(newReaction);

      // Act
      const result = await service.reactToPost(userId, postId, reactionDto);

      // Assert
      expect(postRepository.findById).toHaveBeenCalledWith(postId);
      expect(postReactionRepository.findOne).toHaveBeenCalledWith({
        where: {
          postId,
          userId,
          type: reactionDto.type,
        },
      });
      expect(postRepository.incrementReactionCount).toHaveBeenCalledWith(
        postId,
      );
      expect(postReactionRepository.create).toHaveBeenCalledWith({
        postId,
        userId,
        type: reactionDto.type,
      });
      expect(result).toEqual(newReaction);
    });

    it('should remove an existing reaction (toggle off)', async () => {
      // Arrange
      const userId = 'user-123';
      const postId = 'post-123';
      const reactionDto = {
        type: ReactionType.LIKE,
      };

      const post = {
        id: postId,
        content: 'Test post',
        privacy: PostPrivacy.PUBLIC,
        authorId: 'other-user-456',
      };

      const existingReaction = {
        id: 'reaction-123',
        postId,
        userId,
        type: reactionDto.type,
      };

      // Mock implementations
      postRepository.findById.mockResolvedValue(post);
      postReactionRepository.findOne.mockResolvedValue(existingReaction);
      postReactionRepository.remove.mockResolvedValue(existingReaction);

      // Act
      const result = await service.reactToPost(userId, postId, reactionDto);

      // Assert
      expect(postReactionRepository.remove).toHaveBeenCalledWith(
        existingReaction,
      );
      expect(postRepository.decrementReactionCount).toHaveBeenCalledWith(
        postId,
      );
      expect(result).toBeNull();
    });

    it('should change reaction type if user already reacted with different type', async () => {
      // Arrange
      const userId = 'user-123';
      const postId = 'post-123';
      const reactionDto = {
        type: ReactionType.CELEBRATE,
      };

      const post = {
        id: postId,
        content: 'Test post',
        privacy: PostPrivacy.PUBLIC,
        authorId: 'other-user-456',
      };

      const existingReaction = {
        id: 'reaction-123',
        postId,
        userId,
        type: ReactionType.LIKE,
      };

      const updatedReaction = {
        ...existingReaction,
        type: reactionDto.type,
      };

      // Mock implementations
      postRepository.findById.mockResolvedValue(post);
      postReactionRepository.findOne
        .mockResolvedValueOnce(null) // First call for exact type match
        .mockResolvedValueOnce(existingReaction); // Second call for any reaction by user
      postReactionRepository.save.mockResolvedValue(updatedReaction);

      // Act
      const result = await service.reactToPost(userId, postId, reactionDto);

      // Assert
      expect(postReactionRepository.save).toHaveBeenCalledWith({
        ...existingReaction,
        type: reactionDto.type,
      });
      expect(result).toEqual(updatedReaction);
    });
  });

  describe('getActivityFeed', () => {
    it('should return activity feed with posts and total count', async () => {
      // Arrange
      const userId = 'user-123';
      const page = 1;
      const limit = 10;
      const connections = ['user-456', 'user-789'];
      const posts = [
        { id: 'post-1', content: 'Post 1' },
        { id: 'post-2', content: 'Post 2' },
      ];
      const total = 2;

      // Mock implementations
      userService.getUserConnections.mockResolvedValue(connections);
      postRepository.getActivityFeed.mockResolvedValue([posts, total]);

      // Act
      const result = await service.getActivityFeed(userId, page, limit);

      // Assert
      expect(userService.getUserConnections).toHaveBeenCalledWith(userId);
      expect(postRepository.getActivityFeed).toHaveBeenCalledWith(
        userId,
        connections,
        0, // skip = (page - 1) * limit
        limit,
      );
      expect(result).toEqual({ posts, total });
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const postId = 'post-123';

      const post = {
        id: postId,
        content: 'Test post',
        authorId: userId,
        originalPostId: null,
      };

      // Mock implementations
      postRepository.findById.mockResolvedValue(post);
      postRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.deletePost(userId, postId);

      // Assert
      expect(postRepository.findById).toHaveBeenCalledWith(postId);
      expect(postRepository.delete).toHaveBeenCalledWith(postId);
    });

    it('should decrement original post reaction count when deleting a repost', async () => {
      // Arrange
      const userId = 'user-123';
      const postId = 'repost-123';
      const originalPostId = 'original-post-456';

      const post = {
        id: postId,
        content: 'Repost content',
        authorId: userId,
        originalPostId,
      };

      // Mock implementations
      postRepository.findById.mockResolvedValue(post);
      postRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.deletePost(userId, postId);

      // Assert
      expect(postRepository.decrementReactionCount).toHaveBeenCalledWith(
        originalPostId,
      );
      expect(postRepository.delete).toHaveBeenCalledWith(postId);
    });

    it('should throw NotFoundException when post not found', async () => {
      // Arrange
      const userId = 'user-123';
      const postId = 'non-existent-post';

      // Mock implementations
      postRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deletePost(userId, postId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      // Arrange
      const userId = 'user-123';
      const postId = 'post-456';

      const post = {
        id: postId,
        content: 'Test post',
        authorId: 'other-user-789',
      };

      // Mock implementations
      postRepository.findById.mockResolvedValue(post);

      // Act & Assert
      await expect(service.deletePost(userId, postId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
