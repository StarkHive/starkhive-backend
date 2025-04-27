import { Test, TestingModule } from '@nestjs/testing';
import { UserSessionController } from './user-session.controller';
import { UserSessionService } from './user-session.service';

describe('UserSessionController', () => {
  let controller: UserSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSessionController],
      providers: [UserSessionService],
    }).compile();

    controller = module.get<UserSessionController>(UserSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
