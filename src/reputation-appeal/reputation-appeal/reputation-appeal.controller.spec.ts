import { Test, TestingModule } from '@nestjs/testing';
import { ReputationAppealController } from './reputation-appeal.controller';
import { ReputationAppealService } from './reputation-appeal.service';
import { CreateReputationAppealDto } from '../dto/create-reputation-appeal.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionLogService } from '@src/payment/transaction-log.service';
import { UserService } from '@src/user/user.service';
import { ReputationAppeal } from '../entities/reputation-appeal.entity';

describe('ReputationAppealController', () => {
  let controller: ReputationAppealController;
  let service: ReputationAppealService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReputationAppealController],
      providers: [
        ReputationAppealService,
        {
          provide: getRepositoryToken(ReputationAppeal),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: TransactionLogService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReputationAppealController>(ReputationAppealController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

});


