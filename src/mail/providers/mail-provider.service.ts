import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@src/user/entities/user.entity';

/**Mail provider class */
@Injectable()
/**Mail provider class */
export class MailProvider {
  constructor(
    /**inject the mailer Service*/
    private readonly mailerService: MailerService,

    @InjectRepository(User)
        private readonly userRepository: Repository<User>,

    @InjectQueue('email-queue')
    private emailQueue: Queue,
  ) {}

  /** Queue Welcome Email */
  public async queueWelcomeEmail(user: User): Promise<void> {
    await this.emailQueue.add('send-welcome-email', {
      email: user.email,
      name: user.username,
    });
  }

  /**Welcome email class that takes a user as parameter */
  public async WelcomeEmail (user: { email: string; username: string }):Promise<void> {
    await this.mailerService.sendMail({
     to: user.email,
     from: `helpdesk from starkHive.com`,
     subject: `welcome to StarkHive`,
     template: './welcome',
        context: {
        name: user.username,
        email: user.email,
        loginUrl: 'http://localhost:3000/',
    }
    })
}

  public async sendTrackedEmail(user: User): Promise<void> {
    await this.mailerService.sendMail({
      to: user.email,
      from: 'helpdesk@realTimeChat.com',
      subject: 'Your Email Was Sent',
      template: './tracked-email',
      headers: {
        'X-Mailgun-Tag': 'welcome-email',
      },
    });
  }

  public async sendVerificationEmail(user: User): Promise<void> {
    const token = randomBytes(32).toString('hex');
    user.emailTokenVerification = token;
    await this.userRepository.save(user);
  
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verify Your Email',
      template: './verify-email',
      context: {
        name: user.username,
        verificationUrl: `http://localhost:3000/verify-email?token=${token}`,
      },
    });
}
}
