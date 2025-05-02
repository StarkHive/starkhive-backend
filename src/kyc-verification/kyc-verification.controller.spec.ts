import { Test, TestingModule } from '@nestjs/testing';
import { KycVerificationController } from './kyc-verification.controller';
import { KycVerificationService } from './kyc-verification.service';

describe('KycVerificationController', () => {
  let controller: KycVerificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KycVerificationController],
      providers: [KycVerificationService],
    }).compile();

    controller = module.get<KycVerificationController>(KycVerificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
