import { Test, TestingModule } from '@nestjs/testing';
import { ReferralProgramController } from './referral-program.controller';
import { ReferralProgramService } from './referral-program.service';
import { ClaimReferralDto } from './dto/claim-referral.dto';

describe('ReferralProgramController', () => {
  let controller: ReferralProgramController;
  let service: ReferralProgramService;

  const mockService = {
    generateReferralCode: jest.fn(),
    createReferral: jest.fn(),
    claimReferral: jest.fn(),
    processMilestone: jest.fn(),
    getUserReferrals: jest.fn(),
    getUserRewards: jest.fn(),
    getReferralTree: jest.fn(),
    getAdminStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferralProgramController],
      providers: [
        { provide: ReferralProgramService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ReferralProgramController>(ReferralProgramController);
    service = module.get<ReferralProgramService>(ReferralProgramService);
  });

  it('should call generateReferralCode with userId', async () => {
    mockService.generateReferralCode.mockResolvedValue('USER-1234');
    const result = await controller.generateReferralCode('user1234');
    expect(result).toEqual({ referralCode: 'USER-1234' });
  });

  it('should call createReferral', async () => {
    const dto = { referralCode: 'X', inviterId: 'A', inviteeId: null };
    mockService.createReferral.mockResolvedValue({ id: '1' });
    const result = await controller.createeReferral(dto);
    expect(result).toEqual({ id: '1' });
  });

  it('should call claimReferral', async () => {
    const dto: ClaimReferralDto = { referralCode: 'RC', inviteeId: 'userB' };
    mockService.claimReferral.mockResolvedValue({ id: 'referralId' });
    const result = await controller.claimReferral(dto);
    expect(result).toEqual({ id: 'referralId' });
  });

  it('should return admin stats', async () => {
    mockService.getAdminStats.mockResolvedValue({ totalReferrals: 10 });
    const result = await controller.getAdminStats();
    expect(result.totalReferrals).toBe(10);
  });
});
