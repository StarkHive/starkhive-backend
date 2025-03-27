import { Test, TestingModule } from '@nestjs/testing';
import { FreelancerPostingsController } from './freelancer-postings.controller';
import { FreelancerPostingsService } from './freelancer-postings.service';

describe('FreelancerPostingsController', () => {
  let controller: FreelancerPostingsController;
  let service: FreelancerPostingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreelancerPostingsController],
      providers: [
        {
          provide: FreelancerPostingsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FreelancerPostingsController>(FreelancerPostingsController);
    service = module.get<FreelancerPostingsService>(FreelancerPostingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
