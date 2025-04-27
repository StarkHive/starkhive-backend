import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { MailProvider } from './providers/mail-provider.service';
import { User } from '@sentry/node';

const mockMailerService = {
  sendMail: jest.fn().mockResolvedValue(true), // Mocking the mailer service
};

describe('MailProvider', () => {
  let mailProvider: MailProvider;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailProvider,
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    mailProvider = module.get<MailProvider>(MailProvider);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(mailProvider).toBeDefined();
  });

  it('should send a welcome email', async () => {
    const user: User = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    await mailProvider.WelcomeEmail(user);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: user.email,
      from: 'helpdesk from realTimeChat.com',
      subject: 'welcome to realTimeChat',
      template: './welcome',
      context: {
        name: user.firstName,
        email: user.email,
        loginUrl: 'http://localhost:3000/',
      },
    });
  });
});