import { Test, TestingModule } from '@nestjs/testing';
import { JobTagsController } from './job-tags.controller';
import { JobTagsService } from './job-tags.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { VoteType } from './enums/voteType.enum';

// Mock service
const mockJobTagsService = {
  submitTag: jest.fn(),
  voteOnTag: jest.fn(),
  checkUserVoteLimit: jest.fn(),
  getTagsForJob: jest.fn(),
};

describe('JobTagsController', () => {
  let controller: JobTagsController;
  let service: JobTagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobTagsController],
      providers: [
        {
          provide: JobTagsService,
          useValue: mockJobTagsService,
        },
      ],
    }).compile();

    controller = module.get<JobTagsController>(JobTagsController);
    service = module.get<JobTagsService>(JobTagsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('submitTag', () => {
    it('should call service.submitTag with correct parameters', async () => {
      // Arrange
      const createTagDto = {
        name: 'Remote',
        description: 'Work from anywhere',
        jobId: 'job-123',
      };
      const req = { user: { id: 'user-123' } };
      const expectedResult = { id: 'tag-123', ...createTagDto };

      jest.spyOn(service, 'submitTag').mockResolvedValue(expectedResult as any);

      // Act
      const result = await controller.submitTag(createTagDto, req);

      // Assert
      expect(service.submitTag).toHaveBeenCalledWith(createTagDto, req.user.id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('voteOnTag', () => {
    it('should call service.voteOnTag with correct parameters when user has not reached limit', async () => {
      // Arrange
      const tagId = 'tag-123';
      const voteTagDto = { voteType: VoteType.UPVOTE };
      const req = { user: { id: 'user-123' } };
      const expectedResult = { id: tagId, upvotes: 1, downvotes: 0 };

      jest.spyOn(service, 'checkUserVoteLimit').mockResolvedValue(false);
      jest.spyOn(service, 'voteOnTag').mockResolvedValue(expectedResult as any);

      // Act
      const result = await controller.voteOnTag(tagId, voteTagDto, req);

      // Assert
      expect(service.checkUserVoteLimit).toHaveBeenCalledWith(req.user.id);
      expect(service.voteOnTag).toHaveBeenCalledWith(
        tagId,
        voteTagDto,
        req.user.id,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw HttpException when user has reached daily vote limit', async () => {
      // Arrange
      const tagId = 'tag-123';
      const voteTagDto = { voteType: VoteType.UPVOTE };
      const req = { user: { id: 'user-123' } };

      jest.spyOn(service, 'checkUserVoteLimit').mockResolvedValue(true);

      // Act & Assert
      await expect(
        controller.voteOnTag(tagId, voteTagDto, req),
      ).rejects.toThrow(
        new HttpException(
          'You have reached your daily vote limit',
          HttpStatus.TOO_MANY_REQUESTS,
        ),
      );
      expect(service.checkUserVoteLimit).toHaveBeenCalledWith(req.user.id);
      expect(service.voteOnTag).not.toHaveBeenCalled();
    });
  });

  describe('getTagsForJob', () => {
    it('should call service.getTagsForJob with correct parameters', async () => {
      // Arrange
      const query = { jobId: 'job-123' };
      const expectedResult = [
        { id: 'tag-1', name: 'Remote', confidenceScore: 0.8 },
        { id: 'tag-2', name: 'Full-time', confidenceScore: 0.6 },
      ];

      jest
        .spyOn(service, 'getTagsForJob')
        .mockResolvedValue(expectedResult as any);

      // Act
      const result = await controller.getTagsForJob(query);

      // Assert
      expect(service.getTagsForJob).toHaveBeenCalledWith(query.jobId);
      expect(result).toEqual(expectedResult);
    });
  });
});
