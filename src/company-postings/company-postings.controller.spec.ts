import { Test, TestingModule } from '@nestjs/testing';
import { CompanyPostingsController } from './company-postings.controller';

describe('CompanyPostingsController', () => {
  let controller: CompanyPostingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyPostingsController],
    }).compile();

    controller = module.get<CompanyPostingsController>(CompanyPostingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
