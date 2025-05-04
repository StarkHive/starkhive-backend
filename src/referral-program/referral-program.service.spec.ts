import { Test, TestingModule } from '@nestjs/testing';
import { ReferralProgramService } from './referral-program.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Referral } from './entities/referral.entity';
import { ReferralReward, RewardMilestoneType, RewardType } from './entities/referral-reward.entity';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

const mockReferralRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  })),
});

const mockReferralRewardRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  find: jest.fn(),
});

describe('ReferralProgramService', () => {
  let service: ReferralProgramService;
  let referralRepo;
  let rewardRepo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralProgramService,
        { provide: getRepositoryToken(Referral), useFactory: mockReferralRepository },
        { provide: getRepositoryToken(ReferralReward), useFactory: mockReferralRewardRepository },
      ],
    }).compile();

    service = module.get<ReferralProgramService>(ReferralProgramService);
    referralRepo = module.get(getRepositoryToken(Referral));
    rewardRepo = module.get(getRepositoryToken(ReferralReward));
  });

  it('should generate a unique referral code', async () => {
    referralRepo.findOne.mockResolvedValueOnce(null); // no existing code
    const code = await service.generateReferralCode('user1234');
    expect(code).toMatch(/^USER.*-.*/);
  });

  it('should create a referral if code is unique', async () => {
    referralRepo.findOne.mockResolvedValue(null);
    referralRepo.create.mockReturnValue({ referralCode: 'CODE', inviterId: 'inviter', inviteeId: null });
    referralRepo.save.mockResolvedValue({ id: '1' });

    const result = await service.createReferral({
      referralCode: 'CODE',
      inviterId: 'inviter',
      inviteeId: null,
    });

    expect(result).toEqual({ id: '1' });
  });

  it('should throw ConflictException for duplicate referral code', async () => {
    referralRepo.findOne.mockResolvedValue({ id: 'exists' });

    await expect(service.createReferral({
      referralCode: 'DUPLICATE',
      inviterId: 'A',
      inviteeId: 'B',
    })).rejects.toThrow(ConflictException);
  });

  it('should throw BadRequestException when inviter equals invitee', async () => {
    referralRepo.findOne.mockResolvedValue({ referralCode: 'RC', claimed: false, inviterId: 'sameUser' });

    await expect(service.claimReferral({ referralCode: 'RC', inviteeId: 'sameUser' }))
      .rejects.toThrow(BadRequestException);
  });

  it('should create a signup reward only if not already created', async () => {
    referralRepo.findOne.mockResolvedValue({
      referralCode: 'RC', claimed: false, inviterId: 'A', id: 'ref1',
    });
    rewardRepo.findOne.mockResolvedValue(null); // No previous reward
    rewardRepo.create.mockReturnValue({ referralId: 'ref1', milestoneType: RewardMilestoneType.SIGNUP });
    rewardRepo.save.mockResolvedValue({});

    await service.claimReferral({ referralCode: 'RC', inviteeId: 'B' });
    expect(rewardRepo.create).toHaveBeenCalled();
  });
});
